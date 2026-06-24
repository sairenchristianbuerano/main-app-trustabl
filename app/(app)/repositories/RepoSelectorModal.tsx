'use client'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Modal, Button, Checkbox, InputField } from '@/components/ui'
import { GitHubIcon } from './GitHubIcon'

export interface RepoItem {
  id: string
  name: string
  language: string
  updatedAgo: string
}

interface RepoSelectorModalProps {
  open: boolean
  onClose: () => void
  onImport: (repos: RepoItem[]) => void
  repos: RepoItem[]
}

export function RepoSelectorModal({ open, onClose, onImport, repos }: RepoSelectorModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(
    () => repos.filter(r => r.name.toLowerCase().includes(search.toLowerCase())),
    [repos, search],
  )

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImport = () => {
    const chosen = repos.filter(r => selected.has(r.id))
    onImport(chosen)
    setSearch('')
    setSelected(new Set())
  }

  const handleClose = () => {
    onClose()
    setSearch('')
    setSelected(new Set())
  }

  const count = selected.size

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Select repositories to scan"
      footer={
        <>
          <span className="mr-auto text-xs text-[var(--color-text-tertiary)]">
            {count} selected
          </span>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button disabled={count === 0} onClick={handleImport}>
            {count > 0 ? `Import ${count} repo${count > 1 ? 's' : ''}` : 'Import'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-tertiary)]">Choose which GitHub repos to import</p>
          <button
            onClick={() => {
              if (selected.size === filtered.length) setSelected(new Set())
              else setSelected(new Set(filtered.map(r => r.id)))
            }}
            className="text-xs font-medium text-[var(--color-accent-default)] hover:underline"
          >
            {selected.size === filtered.length && filtered.length > 0 ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <InputField
          label=""
          iconLeft={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories..."
        />

        <div className="flex flex-col border border-[var(--color-border-muted)] rounded-[var(--radius-sharp)] max-h-[260px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-tertiary)]">
              No repositories found
            </div>
          ) : (
            filtered.map((repo) => (
              <label
                key={repo.id}
                className="flex items-center gap-3 px-3.5 py-3 border-b border-[var(--color-border-muted)] last:border-b-0 cursor-pointer hover:bg-[var(--color-bg-surface)] transition-[background] duration-[var(--duration-fast)]"
              >
                <Checkbox
                  checked={selected.has(repo.id)}
                  onChange={() => toggle(repo.id)}
                />
                <GitHubIcon size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{repo.name}</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    Updated {repo.updatedAgo} · {repo.language}
                  </span>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
