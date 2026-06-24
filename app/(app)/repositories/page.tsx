'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderGit2, RefreshCw, Download, Search, Loader2,
  MoreHorizontal, Eye, Trash2,
} from 'lucide-react'
import {
  Button, Badge, Table, InputField, Dropdown,
  Pagination,
} from '@/components/ui'
import { Popover } from '@/components/ui/Popover'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/patterns/EmptyState'
import { useToast } from '@/components/ui/ToastContext'
import { GitHubIcon } from './GitHubIcon'
import { GitHubConnectModal } from './GitHubConnectModal'
import { RepoSelectorModal, type RepoItem } from './RepoSelectorModal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useRepos, type ImportedRepo } from './RepoContext'
import { getRepoDetail } from './[id]/mock-data'

type RepoStatus = 'pass' | 'fail' | 'warning' | 'scanning'
type SortKey = 'name' | 'status' | 'readiness' | 'findings' | 'lastScan'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE_DEFAULT = 5

const AVAILABLE_REPOS: RepoItem[] = [
  { id: '1', name: 'ai-chatbot', language: 'TypeScript', updatedAgo: '2 hours' },
  { id: '2', name: 'agent-pipeline', language: 'Python', updatedAgo: '1 day' },
  { id: '3', name: 'llm-gateway', language: 'Go', updatedAgo: '3 days' },
  { id: '4', name: 'prompt-engine', language: 'TypeScript', updatedAgo: '5 days' },
  { id: '5', name: 'eval-harness', language: 'Python', updatedAgo: '1 week' },
  { id: '6', name: 'rag-service', language: 'Python', updatedAgo: '2 weeks' },
  { id: '7', name: 'tool-executor', language: 'Rust', updatedAgo: '3 weeks' },
]


function readinessColor(value: number): string {
  if (value >= 80) return 'var(--color-success-text)'
  if (value >= 50) return 'var(--color-warning-text)'
  return 'var(--color-danger-text)'
}

const statusConfig: Record<RepoStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }> = {
  pass: { label: 'Pass', variant: 'success' },
  fail: { label: 'Fail', variant: 'danger' },
  warning: { label: 'Warning', variant: 'warning' },
  scanning: { label: 'Scanning…', variant: 'info' },
}

export default function RepositoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { repos, setRepos, githubConnected, setGithubConnected } = useRepos()

  const [connectOpen, setConnectOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('readiness')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)

  // --- Computed ---
  const stats = useMemo(() => {
    const total = repos.length
    const passing = repos.filter(r => r.status === 'pass').length
    const failing = repos.filter(r => r.status === 'fail').length
    const scannable = repos.filter(r => r.status !== 'scanning')
    const avgReadiness = scannable.length > 0
      ? Math.round(scannable.reduce((sum, r) => sum + r.readiness, 0) / scannable.length)
      : 0
    return { total, passing, failing, avgReadiness }
  }, [repos])

  const languageOptions = useMemo(() => {
    const langs = [...new Set(repos.map(r => r.language))].sort()
    return [{ label: 'All languages', value: '' }, ...langs.map(l => ({ label: l, value: l }))]
  }, [repos])

  const statusOptions = [
    { label: 'All statuses', value: '' },
    { label: 'Pass', value: 'pass' },
    { label: 'Fail', value: 'fail' },
    { label: 'Warning', value: 'warning' },
    { label: 'Scanning', value: 'scanning' },
  ]

  const filtered = useMemo(() => {
    let list = repos

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.framework.toLowerCase().includes(q) || r.language.toLowerCase().includes(q))
    }
    if (statusFilter) list = list.filter(r => r.status === statusFilter)
    if (languageFilter) list = list.filter(r => r.language === languageFilter)

    list = [...list].sort((a, b) => {
      const aScanning = a.status === 'scanning' ? 0 : 1
      const bScanning = b.status === 'scanning' ? 0 : 1
      if (aScanning !== bScanning) return aScanning - bScanning

      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'readiness': cmp = a.readiness - b.readiness; break
        case 'findings': cmp = a.findings - b.findings; break
        case 'lastScan': cmp = a.lastScan.localeCompare(b.lastScan); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [repos, searchQuery, statusFilter, languageFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // --- Simulate scan completion ---
  const scanTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const scanning = repos.filter(r => r.status === 'scanning')
    for (const repo of scanning) {
      if (scanTimers.current.has(repo.id)) continue
      const delay = 3000 + Math.random() * 4000
      const timer = setTimeout(() => {
        setRepos(prev => prev.map(r => {
          if (r.id !== repo.id) return r
          const detail = getRepoDetail(r.name)
          return {
            ...r,
            status: detail.repo.gate_status === 'pass' ? 'pass' : detail.repo.readiness_score >= 50 ? 'warning' : 'fail',
            readiness: detail.repo.readiness_score,
            findings: detail.repo.findings_count,
            framework: detail.repo.framework,
            lastScan: 'Just now',
          }
        }))
        scanTimers.current.delete(repo.id)
      }, delay)
      scanTimers.current.set(repo.id, timer)
    }
    return () => {
      scanTimers.current.forEach(t => clearTimeout(t))
      scanTimers.current.clear()
    }
  }, [repos])

  // --- Handlers ---
  const handleAddRepo = useCallback(() => {
    if (githubConnected) setSelectorOpen(true)
    else setConnectOpen(true)
  }, [githubConnected])

  const handleGitHubConnect = useCallback(() => {
    setGithubConnected(true)
    setConnectOpen(false)
    setSelectorOpen(true)
    toast('GitHub connected successfully')
  }, [toast])

  const handleImport = useCallback((imported: RepoItem[]) => {
    const newRepos: ImportedRepo[] = imported.map(r => ({
      id: r.id,
      name: r.name,
      language: r.language,
      framework: 'Unknown',
      status: 'scanning' as RepoStatus,
      readiness: 0,
      findings: 0,
      lastScan: 'In progress',
      lastScanBy: 'Zane F.',
    }))
    setRepos(prev => [...prev, ...newRepos])
    setSelectorOpen(false)
    toast(`${imported.length} repositor${imported.length > 1 ? 'ies' : 'y'} imported successfully`)
  }, [toast])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }, [sortKey])

  const handleRescan = useCallback((ids: string[]) => {
    setRepos(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'scanning' as RepoStatus, lastScan: 'In progress', lastScanBy: 'Zane F.' } : r))
    toast(`Rescanning ${ids.length} repositor${ids.length > 1 ? 'ies' : 'y'}`)
    setSelectedIds([])
  }, [toast])

  const handleDelete = useCallback((ids: string[]) => {
    setRepos(prev => prev.filter(r => !ids.includes(r.id)))
    toast(`${ids.length} repositor${ids.length > 1 ? 'ies' : 'y'} removed`)
    setSelectedIds([])
  }, [toast])

  const availableToImport = AVAILABLE_REPOS.filter(r => !repos.some(ir => ir.id === r.id))
  const hasRepos = repos.length > 0
  const hasSelection = selectedIds.length > 0

  // --- Table Columns ---
  const columns = useMemo(() => [
    {
      key: 'name' as const,
      label: 'Repository',
      sortable: true,
      width: 'w-[29%]',
      render: (_: unknown, row: ImportedRepo) => (
        <div className="flex items-center gap-2.5">
          <GitHubIcon size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{row.name}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{row.framework} · {row.language}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: true,
      width: 'w-[12%]',
      render: (val: unknown) => {
        const s = val as RepoStatus
        const cfg = statusConfig[s]
        return (
          <Badge variant={cfg.variant} size="sm">
            <span className="flex items-center gap-1.5">
              {s === 'scanning' && <Loader2 size={12} className="animate-spin" />}
              {cfg.label}
            </span>
          </Badge>
        )
      },
    },
    {
      key: 'readiness' as const,
      label: 'Readiness',
      sortable: true,
      width: 'w-[18%]',
      render: (val: unknown, row: ImportedRepo) => {
        const v = val as number
        return (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium w-[36px]" style={{ color: row.status === 'scanning' ? 'var(--color-text-tertiary)' : readinessColor(v) }}>
              {row.status === 'scanning' ? '—' : `${v}%`}
            </span>
            <div className="w-[80px]">
              <ProgressBar value={row.status === 'scanning' ? 0 : v} />
            </div>
          </div>
        )
      },
    },
    {
      key: 'findings' as const,
      label: 'Findings',
      sortable: true,
      width: 'w-[11%]',
      render: (_: unknown, row: ImportedRepo) => (
        <span className={`text-sm ${row.status === 'scanning' ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
          {row.status === 'scanning' ? '—' : row.findings}
        </span>
      ),
    },
    {
      key: 'lastScan' as const,
      label: 'Last scan',
      sortable: true,
      width: 'w-[14%]',
      render: (_: unknown, row: ImportedRepo) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-text-primary)]">{row.lastScan}</span>
          <span className="text-[11px] text-[var(--color-text-tertiary)]">by {row.lastScanBy}</span>
        </div>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: 'w-[12%]',
      align: 'center' as const,
      render: (_: unknown, row: ImportedRepo) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="Rescan" position="top">
            <Button
              variant="text"
              size="sm"
              icon={RefreshCw}
              iconOnly
              disabled={row.status === 'scanning'}
              onClick={(e) => { e.stopPropagation(); handleRescan([row.id]) }}
              aria-label="Rescan"
            />
          </Tooltip>
          <div onClick={(e) => e.stopPropagation()}>
          <Tooltip content="More actions" position="top">
            <Popover
              trigger={
                <Button variant="text" size="sm" icon={MoreHorizontal} iconOnly aria-label="More actions" />
              }
            type="menu"
            position="bottom"
            items={[
              { label: 'View details', icon: Eye, onClick: () => {} },
              { label: 'Delete', icon: Trash2, onClick: () => handleDelete([row.id]), danger: true },
            ]}
          />
          </Tooltip>
          </div>
        </div>
      ),
    },
  ], [handleRescan, handleDelete])

  // --- Filter tabs ---


  if (!hasRepos) {
    return (
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={FolderGit2}
            title="No repositories yet"
            description="Add your first repository to start scanning for production gaps in your AI agents."
            action={{ label: 'Add repository', onClick: handleAddRepo }}
          />
        </div>
        <GitHubConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onSuccess={handleGitHubConnect} />
        <RepoSelectorModal open={selectorOpen} onClose={() => setSelectorOpen(false)} onImport={handleImport} repos={availableToImport} />
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
      <div className="w-full max-w-[1120px] flex flex-col gap-4">

          {/* Toolbar */}
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3">
              <div className="w-[260px]">
                <InputField label="" iconLeft={Search} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} placeholder="Search repositories..." />
              </div>
              <div className="w-[150px]">
                <Dropdown options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v as string); setCurrentPage(1) }} placeholder="All statuses" />
              </div>
              <div className="w-[160px]">
                <Dropdown options={languageOptions} value={languageFilter} onChange={(v) => { setLanguageFilter(v as string); setCurrentPage(1) }} placeholder="All languages" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button icon={FolderGit2} onClick={handleAddRepo} disabled={availableToImport.length === 0}>
                Add repository
              </Button>
            </div>
          </div>

          {/* Bulk actions bar */}
          {hasSelection && (
            <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {selectedIds.length} repositor{selectedIds.length > 1 ? 'ies' : 'y'} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={Download} onClick={() => toast('Export started')}>Export selected</Button>
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => handleRescan(selectedIds)}>Rescan selected</Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(selectedIds)}>Delete</Button>
              </div>
            </div>
          )}

          {/* Table */}
          <Table
            columns={columns}
            data={paginated}
            selectable
            selectedRows={selectedIds}
            onSelect={setSelectedIds}
            sortKey={sortKey}
            sortDirection={sortDir}
            onSort={(key) => handleSort(key as SortKey)}
            onRowClick={(row) => { if (row.status !== 'scanning') router.push(`/repositories/${encodeURIComponent(row.name)}`) }}
          />

          {/* Pagination */}
          {filtered.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
            />
          )}
        </div>

      <GitHubConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onSuccess={handleGitHubConnect} />
      <RepoSelectorModal open={selectorOpen} onClose={() => setSelectorOpen(false)} onImport={handleImport} repos={availableToImport} />
    </main>
  )
}
