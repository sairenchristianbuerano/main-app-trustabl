'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ScanSearch, RefreshCw, Search, Loader2, Play,
  Trash2, Filter, ArrowRight, Wand2, Bell, BellOff, MoreVertical,
} from 'lucide-react'
import {
  Button, Badge, Table, InputField, Dropdown,
  Pagination, Modal,
} from '@/components/ui'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/patterns/EmptyState'
import { useToast } from '@/components/ui/ToastContext'
import { useNotifications } from '@/components/ui/NotificationContext'
import { GitHubIcon } from './GitHubIcon'
import { GitHubConnectModal } from './GitHubConnectModal'
import { RepoSelectorModal, type RepoItem } from './RepoSelectorModal'
import { useRepos, type ImportedRepo } from './RepoContext'
import { getRepoDetail } from './[id]/mock-data'
import { getAutofixRepos } from '../autofix/mock-data'
import { useAutofixPreflight } from '@/hooks/useAutofixPreflight'

type SortKey = 'name' | 'scanStatus' | 'autofixStatus' | 'lastActivity'
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

const scanStatusConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral' }> = {
  not_scanned: { label: 'Not scanned', variant: 'neutral' },
  scanning: { label: 'Scanning…', variant: 'info' },
  pass: { label: 'Pass', variant: 'success' },
  fail: { label: 'Fail', variant: 'danger' },
  warning: { label: 'Warning', variant: 'warning' },
}

function autofixGateStatus(r: ImportedRepo): { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral' } {
  const a = r.autofix
  if (a.status === 'not_run') return { label: 'Not run', variant: 'neutral' }
  if (a.status === 'running') return { label: 'Running…', variant: 'info' }
  const pct = a.fix_readiness ?? 0
  if (pct >= 100) return { label: 'Pass', variant: 'success' }
  if (pct >= 50) return { label: 'Warning', variant: 'warning' }
  return { label: 'Fail', variant: 'danger' }
}

export default function RepositoriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification, startBatch, reportScanResult, reportAutofixResult } = useNotifications()
  const { repos, setRepos, githubConnected, setGithubConnected, toggleMute } = useRepos()

  const [connectOpen, setConnectOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ImportedRepo | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('scanStatus')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)

  useEffect(() => {
    if (!openMenuId) return
    const handler = () => setOpenMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMenuId])

  const languages = useMemo(() => [...new Set(repos.map(r => r.language))].sort(), [repos])
  const frameworks = useMemo(() => [...new Set(repos.map(r => r.framework).filter(f => f !== 'Unknown'))].sort(), [repos])

  const filterOptions = useMemo(() => [
    { label: 'Not scanned', value: 'scan:not_scanned', group: 'Scan Status' },
    { label: 'Pass', value: 'scan:pass', group: 'Scan Status' },
    { label: 'Fail', value: 'scan:fail', group: 'Scan Status' },
    { label: 'Warning', value: 'scan:warning', group: 'Scan Status' },
    { label: 'Not run', value: 'af:not_run', group: 'Autofix Status' },
    { label: 'Ready', value: 'af:ready', group: 'Autofix Status' },
    { label: 'All applied', value: 'af:all_applied', group: 'Autofix Status' },
    ...frameworks.map(f => ({ label: f, value: `fw:${f}`, group: 'Framework' })),
    ...languages.map(l => ({ label: l, value: `lang:${l}`, group: 'Language' })),
  ], [languages, frameworks])

  const filtered = useMemo(() => {
    let list = repos

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q))
    }

    if (activeFilters.length > 0) {
      const scanStatuses = activeFilters.filter(f => f.startsWith('scan:')).map(f => f.slice(5))
      if (scanStatuses.length) list = list.filter(r => scanStatuses.includes(r.scanner.status))

      const afStatuses = activeFilters.filter(f => f.startsWith('af:')).map(f => f.slice(3))
      if (afStatuses.length) list = list.filter(r => afStatuses.includes(r.autofix.status))

      const fws = activeFilters.filter(f => f.startsWith('fw:')).map(f => f.slice(3))
      if (fws.length) list = list.filter(r => fws.includes(r.framework))

      const langs = activeFilters.filter(f => f.startsWith('lang:')).map(f => f.slice(5))
      if (langs.length) list = list.filter(r => langs.includes(r.language))
    }

    list = [...list].sort((a, b) => {
      const aScanning = a.scanner.status === 'scanning' ? 0 : 1
      const bScanning = b.scanner.status === 'scanning' ? 0 : 1
      if (aScanning !== bScanning) return aScanning - bScanning

      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'scanStatus': cmp = (a.scanner.readiness ?? -1) - (b.scanner.readiness ?? -1); break
        case 'autofixStatus': cmp = (a.autofix.fix_readiness ?? -1) - (b.autofix.fix_readiness ?? -1); break
        case 'lastActivity': cmp = (a.last_activity.timestamp ?? '').localeCompare(b.last_activity.timestamp ?? ''); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [repos, searchQuery, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // --- Scan completion simulation ---
  const scanTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const scanning = repos.filter(r => r.scanner.status === 'scanning')
    for (const repo of scanning) {
      if (scanTimers.current.has(repo.id)) continue
      const delay = 3000 + Math.random() * 4000
      const timer = setTimeout(() => {
        setRepos(prev => prev.map(r => {
          if (r.id !== repo.id) return r
          const detail = getRepoDetail(r.name)
          const scanStatus = detail.repo.gate_status === 'pass' ? 'pass' : detail.repo.readiness_score >= 50 ? 'warning' : 'fail'
          return {
            ...r,
            framework: detail.repo.framework,
            scanner: {
              status: scanStatus as 'pass' | 'fail' | 'warning',
              readiness: detail.repo.readiness_score,
              findings_count: detail.repo.findings_count,
              last_scan_at: 'Just now',
              last_scan_by: 'Zane F.',
            },
            last_activity: { type: 'scan' as const, timestamp: 'Just now', by: 'Zane F.' },
          }
        }))
        const detail = getRepoDetail(repo.name)
        const scanStatus = detail.repo.gate_status === 'pass' ? 'pass' : detail.repo.readiness_score >= 50 ? 'warning' : 'fail'
        const inBatch = reportScanResult(repo.id, scanStatus)
        if (!inBatch) {
          addNotification({
            type: 'scan_completed',
            content: `Scan completed — ${repo.name} · ${scanStatus}, ${detail.repo.findings_count} findings`,
            status: scanStatus,
            link: { page: 'repositories', params: { repo: repo.name } },
            batch_id: null,
            batch_summary: null,
          })
        }
        scanTimers.current.delete(repo.id)
      }, delay)
      scanTimers.current.set(repo.id, timer)
    }
    return () => {
      scanTimers.current.forEach(t => clearTimeout(t))
      scanTimers.current.clear()
    }
  }, [repos, addNotification, reportScanResult])

  // --- Autofix completion simulation ---
  const autofixTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const running = repos.filter(r => r.autofix.status === 'running')
    for (const repo of running) {
      if (autofixTimers.current.has(repo.id)) continue
      const delay = 4000 + Math.random() * 3000
      const fixesReady = 5 + Math.floor(Math.random() * 10)
      const timer = setTimeout(() => {
        setRepos(prev => prev.map(r => {
          if (r.id !== repo.id) return r
          const total = fixesReady + (r.autofix.fixes_applied ?? 0)
          return {
            ...r,
            autofix: {
              status: 'ready' as const,
              fix_readiness: total > 0 ? Math.round(((r.autofix.fixes_applied ?? 0) / total) * 100) : 0,
              fixes_ready: fixesReady,
              fixes_applied: r.autofix.fixes_applied ?? 0,
              fixes_total: total,
              last_run_at: 'Just now',
              last_run_by: 'Zane F.',
            },
            last_activity: { type: 'autofix' as const, timestamp: 'Just now', by: 'Zane F.' },
          }
        }))
        toast(`Autofix complete for ${repo.name}`)
        const inBatch = reportAutofixResult(repo.id, fixesReady)
        if (!inBatch) {
          addNotification({
            type: 'autofix_completed',
            content: `Autofix completed — ${fixesReady} fixes ready in ${repo.name}`,
            link: { page: 'repositories', params: { repo: repo.name, tab: 'autofix' } },
            batch_id: null,
            batch_summary: null,
          })
        }
        autofixTimers.current.delete(repo.id)
      }, delay)
      autofixTimers.current.set(repo.id, timer)
    }
    return () => {
      autofixTimers.current.forEach(t => clearTimeout(t))
      autofixTimers.current.clear()
    }
  }, [repos, toast, addNotification, reportAutofixResult])

  // --- Simulated teammate activity (individual, non-batched) ---
  const teammateFixFired = useRef(false)
  useEffect(() => {
    if (teammateFixFired.current || repos.length === 0) return
    teammateFixFired.current = true
    const teammates = ['Charlie', 'Diana']
    const timer = setTimeout(() => {
      const repo = repos[Math.floor(Math.random() * repos.length)]
      const teammate = teammates[Math.floor(Math.random() * teammates.length)]
      addNotification({
        type: 'fix_applied',
        content: `${teammate} applied a fix in ${repo.name}`,
        link: { page: 'repositories', params: { repo: repo.name, tab: 'autofix' } },
        batch_id: null,
        batch_summary: null,
      })
    }, 20000 + Math.random() * 10000)
    return () => clearTimeout(timer)
  }, [repos, addNotification])

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
      scanner: {
        status: 'scanning' as const,
        readiness: null,
        findings_count: null,
        last_scan_at: 'In progress',
        last_scan_by: 'Zane F.',
      },
      autofix: {
        status: 'not_run' as const,
        fix_readiness: null,
        fixes_ready: null,
        fixes_applied: null,
        fixes_total: null,
        last_run_at: null,
        last_run_by: null,
      },
      last_activity: { type: 'scan' as const, timestamp: 'In progress', by: 'Zane F.' },
      notifications_muted: false,
    }))
    if (newRepos.length >= 2) startBatch('scan', newRepos.map(r => r.id))
    setRepos(prev => [...prev, ...newRepos])
    setSelectorOpen(false)
    toast(`${imported.length} repositor${imported.length > 1 ? 'ies' : 'y'} imported successfully`)
  }, [toast, startBatch])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }, [sortKey])

  const handleScan = useCallback((ids: string[]) => {
    if (ids.length >= 2) startBatch('scan', ids)
    setRepos(prev => prev.map(r => {
      if (!ids.includes(r.id)) return r
      return {
        ...r,
        scanner: { ...r.scanner, status: 'scanning' as const, last_scan_at: 'In progress', last_scan_by: 'Zane F.' },
        last_activity: { type: 'scan' as const, timestamp: 'In progress', by: 'Zane F.' },
      }
    }))
    toast(`Scanning ${ids.length} repositor${ids.length > 1 ? 'ies' : 'y'}`)
    setSelectedIds([])
  }, [toast, startBatch])

  const startAutofixRun = useCallback((idsOrId: string | string[]) => {
    const ids = Array.isArray(idsOrId) ? idsOrId : [idsOrId]
    if (ids.length >= 2) startBatch('autofix', ids)
    setRepos(prev => prev.map(r => {
      if (!ids.includes(r.id)) return r
      return {
        ...r,
        autofix: { ...r.autofix, status: 'running' as const, last_run_at: 'In progress', last_run_by: 'Zane F.' },
        last_activity: { type: 'autofix' as const, timestamp: 'In progress', by: 'Zane F.' },
      }
    }))
    toast(`Autofix started for ${ids.length} repositor${ids.length > 1 ? 'ies' : 'y'}`)
    setSelectedIds([])
  }, [toast, startBatch])

  const { run: runAutofixWithChecks, checking: checkingAutofix, modals: autofixPreflightModals } = useAutofixPreflight(startAutofixRun)

  const handleDelete = useCallback((ids: string[]) => {
    setRepos(prev => prev.filter(r => !ids.includes(r.id)))
    toast(`${ids.length} repositor${ids.length > 1 ? 'ies' : 'y'} removed`)
    setSelectedIds([])
    setDeleteTarget(null)
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
      width: 'w-[22%]',
      render: (_: unknown, row: ImportedRepo) => (
        <div className="flex items-center gap-2.5">
          <GitHubIcon size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{row.name}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{row.framework} · {row.language}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'scanner' as const,
      label: 'Scanner',
      sortable: true,
      width: 'w-[20%]',
      render: (_: unknown, row: ImportedRepo) => {
        const s = row.scanner
        const cfg = scanStatusConfig[s.status]
        const hasData = s.status !== 'not_scanned' && s.status !== 'scanning' && s.readiness !== null
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant={cfg.variant} size="sm">
              <span className="flex items-center gap-1.5">
                {s.status === 'scanning' && <Loader2 size={11} className="animate-spin" />}
                {hasData ? `${cfg.label} · ${s.readiness}%` : cfg.label}
              </span>
            </Badge>
            {hasData && (
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                {s.findings_count} findings
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'autofix' as const,
      label: 'Autofix',
      sortable: true,
      width: 'w-[20%]',
      render: (_: unknown, row: ImportedRepo) => {
        const a = row.autofix
        const gate = autofixGateStatus(row)
        const hasData = a.status !== 'not_run' && a.status !== 'running' && a.fix_readiness !== null
        const pending = hasData ? (a.fixes_total ?? 0) - (a.fixes_applied ?? 0) : 0
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant={gate.variant} size="sm">
              <span className="flex items-center gap-1.5">
                {a.status === 'running' && <Loader2 size={11} className="animate-spin" />}
                {hasData ? `${gate.label} · ${a.fix_readiness}%` : gate.label}
              </span>
            </Badge>
            {hasData && (
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                {pending > 0 ? `${pending} fixes to review` : '0 fixes to review'}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'last_activity' as const,
      label: 'Last activity',
      sortable: true,
      width: 'w-[16%]',
      render: (_: unknown, row: ImportedRepo) => {
        const la = row.last_activity
        if (!la.timestamp) return <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-[var(--color-text-primary)]">{la.timestamp}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {la.type === 'scan' ? 'Scanned' : 'Autofix run'} by {la.by}
            </span>
          </div>
        )
      },
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: 'w-[18%]',
      align: 'center' as const,
      render: (_: unknown, row: ImportedRepo) => {
        const s = row.scanner.status
        const a = row.autofix.status
        if (s === 'scanning' || a === 'running') {
          return <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
        }
        return (
          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
            {s !== 'not_scanned' && a === 'not_run' && (
              <Tooltip content="Run autofix" position="top">
                <Button variant="text" size="sm" icon={Play} iconOnly loading={checkingAutofix} onClick={() => runAutofixWithChecks(row.id)} aria-label="Run autofix" />
              </Tooltip>
            )}
            {(a === 'ready' || a === 'all_applied' || a === 'rejected') && (
              <Tooltip content="Review fixes" position="top">
                <Button variant="text" size="sm" icon={ArrowRight} iconOnly onClick={() => router.push(`/repositories/${encodeURIComponent(row.name)}?tab=autofix`)} aria-label="Review fixes" />
              </Tooltip>
            )}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                className="w-[36px] h-[36px] inline-flex items-center justify-center rounded-[var(--radius-base)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>
              {openMenuId === row.id && (
                <div
                  className="absolute right-0 top-full mt-1 w-[188px] rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] flex flex-col overflow-hidden animate-[fadeScale_150ms_ease-out]"
                  style={{ zIndex: 'var(--z-dropdown)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => { handleScan([row.id]); setOpenMenuId(null) }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] transition-colors duration-150"
                  >
                    <RefreshCw size={14} className="text-[var(--color-text-tertiary)]" />
                    Rescan
                  </button>
                  <div className="h-px bg-[var(--color-border-muted)]" />
                  <button
                    onClick={() => { toggleMute(row.id); toast(row.notifications_muted ? `${row.name} unmuted` : `${row.name} muted`); setOpenMenuId(null) }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] transition-colors duration-150"
                  >
                    {row.notifications_muted ? <BellOff size={14} className="text-[var(--color-text-tertiary)]" /> : <Bell size={14} className="text-[var(--color-text-tertiary)]" />}
                    {row.notifications_muted ? 'Unmute' : 'Mute'}
                  </button>
                  <div className="h-px bg-[var(--color-border-muted)]" />
                  <button
                    onClick={() => { setDeleteTarget(row); setOpenMenuId(null) }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors duration-150"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
  ], [handleScan, runAutofixWithChecks, checkingAutofix, toggleMute, toast, router, openMenuId])

  if (!hasRepos) {
    return (
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={ScanSearch}
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
            <Dropdown
              type="multi"
              placeholder="Filter"
              align="left"
              triggerLabel={activeFilters.length === 0 ? 'Filter' : `Filter (${activeFilters.length})`}
              triggerIcon={<Filter size={14} className="text-[var(--color-text-tertiary)]" />}
              hideChevron
              options={filterOptions}
              value={activeFilters}
              onChange={(v) => { setActiveFilters(v as string[]); setCurrentPage(1) }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button icon={ScanSearch} onClick={handleAddRepo} disabled={availableToImport.length === 0}>
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
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => handleScan(selectedIds)}>Scan selected</Button>
              <Button variant="secondary" size="sm" icon={Wand2} loading={checkingAutofix} onClick={() => runAutofixWithChecks(selectedIds)}>
                {checkingAutofix ? 'Checking...' : 'Run autofix'}
              </Button>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(selectedIds)}>Delete</Button>
            </div>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
            <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
              <Filter size={24} className="text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">No matching repositories</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginated}
            selectable
            selectedRows={selectedIds}
            onSelect={setSelectedIds}
            sortKey={sortKey as keyof ImportedRepo}
            sortDirection={sortDir}
            onSort={(key) => handleSort(key as unknown as SortKey)}
            onRowClick={(row) => {
              if (row.scanner.status !== 'scanning') router.push(`/repositories/${encodeURIComponent(row.name)}`)
            }}
          />
        )}

        {/* Pagination */}
        {filtered.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 25]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
          />
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => deleteTarget && handleDelete([deleteTarget.id])}>Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-primary)]">
          This will permanently remove <strong>{deleteTarget?.name}</strong> and all its scan results and autofix data. This action cannot be undone.
        </p>
      </Modal>

      {autofixPreflightModals}

      <GitHubConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onSuccess={handleGitHubConnect} />
      <RepoSelectorModal open={selectorOpen} onClose={() => setSelectorOpen(false)} onImport={handleImport} repos={availableToImport} />
    </main>
  )
}
