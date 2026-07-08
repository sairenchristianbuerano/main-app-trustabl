'use client'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronDown, RefreshCw, Download,
  CheckCircle, EyeOff, Shield, Eye, Circle,
  Sparkles, Info, AlertTriangle, RotateCcw, Settings, Filter,
  Wand2, Play, Check, X, FileText, Copy, ScanSearch, Search,
} from 'lucide-react'
import { Button, Badge, Pagination, Dropdown, Tabs, Checkbox, Spinner, Tooltip, Modal, InputField, FeatureGateModal, type FeatureGate } from '@/components/ui'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/patterns/EmptyState'
import { useToast } from '@/components/ui/ToastContext'
import { useAutofixPreflight } from '@/hooks/useAutofixPreflight'
import { useEnrichPreflight } from '@/hooks/useEnrichPreflight'
import { useSettings } from '@/app/(app)/settings/SettingsContext'
import { getRepoDetail, generateMockEnrichment, generateRescanResult, type Finding, type ActivityItem, type ScanComparison } from './mock-data'
import {
  getAutofixSession, generateAttestation,
  type AutofixFinding, type AutofixSession, type FixStatus, type AttestationData,
} from '../../autofix/mock-data'
import { useRepos, type EnrichmentState } from '../RepoContext'

// ─── Shared helpers ───

const BLOCKED_ENRICH_RULES = ['META-003']

function canEnrich(finding: Finding): boolean {
  if (BLOCKED_ENRICH_RULES.includes(finding.policyId)) return false
  const desc = finding.description?.toLowerCase() || ''
  if (desc.includes('opaque') || desc.includes('dynamic') || desc.includes('cannot evaluate') || desc.includes('non-literal') || desc.includes('unpack')) return false
  if (!finding.fix || finding.fix.trim() === '') return false
  if (finding.enriched === true) return false
  return true
}

const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const severityStyles: Record<string, { color: string; label: string }> = {
  critical: { color: 'var(--color-danger-text)', label: 'CRIT' },
  high: { color: 'var(--color-warning-text)', label: 'HIGH' },
  medium: { color: 'var(--color-info-text)', label: 'MED' },
  low: { color: 'var(--color-text-tertiary)', label: 'LOW' },
}

// Autofix tab uses a 3-level severity (critical/warning/info), separate from the
// scanner tab's 4-level severity above.
const afSeverityStyles: Record<string, { color: string; label: string }> = {
  critical: { color: 'var(--color-danger-text)', label: 'CRIT' },
  warning: { color: 'var(--color-warning-text)', label: 'WARN' },
  info: { color: 'var(--color-info-text)', label: 'INFO' },
}

const ENRICHMENT_STEPS = [
  'Reading rule context',
  'Analyzing code',
  'Generating code fix...',
  'Building diff',
]

function readinessColor(v: number) {
  if (v >= 80) return 'var(--color-success-text)'
  if (v >= 50) return 'var(--color-warning-text)'
  return 'var(--color-danger-text)'
}

function CircularScore({ value, size = 64 }: { value: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border-muted)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={readinessColor(value)} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-500" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{ color: readinessColor(value) }}>{value}%</span>
    </div>
  )
}

// ─── Autofix constants ───

const fixStatusBadge: Record<FixStatus, { label: string; variant: 'neutral' | 'info' | 'success' | 'warning' | 'danger' } | null> = {
  pending: null,
  running: { label: 'Fixing...', variant: 'info' },
  ready: { label: 'Fix ready', variant: 'success' },
  applied: { label: 'Applied', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
}

const AUTOFIX_STEPS = [
  'Setting up sandbox environment',
  'Loading findings',
  'Generating fixes...',
  'Building diffs',
  'Finalizing report',
]

const FINDING_FIX_STEPS = [
  'Loaded finding context',
  'Analyzed code',
  'Generating code fix...',
  'Building diff',
]

const PAGE_SIZE_OPTIONS = [5, 10, 25]

type AutofixPageState = 'empty' | 'running' | 'results'

// ─── Main page ───

export default function RepoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const slug = decodeURIComponent(params.id as string)
  const data = getRepoDetail(slug)

  const [topTab, setTopTab] = useState<'analysis' | 'autofix'>(searchParams.get('tab') === 'autofix' ? 'autofix' : 'analysis')

  // ─── Feature flags ───
  const { autofixEnabled } = useSettings()
  const [gateModal, setGateModal] = useState<FeatureGate | null>(null)

  // ─── Session cache ───
  const { repos, setRepos, getSession, updateSession, clearSession } = useRepos()
  const cached = getSession(slug)
  const repoEntry = repos.find(r => r.name === slug)

  // ─── Static Analysis state ───
  const [activeFilters, setActiveFilters] = useState<string[]>(() => {
    const filter = searchParams.get('filter')
    if (filter) return filter.split(',')
    return cached?.activeFilters ?? []
  })
  const [expandedFinding, setExpandedFinding] = useState<string | null>(searchParams.get('finding'))
  const [findingsState, setFindingsState] = useState<Finding[]>(cached?.findingsState ?? data.findings)
  const [findingsPage, setFindingsPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeSubTab, setActiveSubTab] = useState<'findings' | 'surfaces' | 'activity'>(cached?.activeSubTab ?? 'findings')
  const [findingsSearch, setFindingsSearch] = useState(cached?.findingsSearch ?? '')
  const [selectedFindings, setSelectedFindings] = useState<Set<string>>(new Set())
  const [enrichmentStates, setEnrichmentStates] = useState<Record<string, EnrichmentState>>(cached?.enrichmentStates ?? {})
  const [enrichmentProgress, setEnrichmentProgress] = useState<Record<string, number>>(cached?.enrichmentProgress ?? {})
  const enrichTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  // ─── Rescan state ───
  const [activityState, setActivityState] = useState<ActivityItem[]>(cached?.activityState ?? data.activity)
  const [lastScanAt, setLastScanAt] = useState(cached?.lastScanAt ?? (data.activity.find(a => a.type === 'scan')?.timestamp ?? 'never'))
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [comparison, setComparison] = useState<ScanComparison | null>(cached?.comparison ?? null)
  const [resolvedSectionOpen, setResolvedSectionOpen] = useState(false)
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (scanTimer.current) clearInterval(scanTimer.current) }, [])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleRescan = useCallback(() => {
    if (scanning) return
    setScanning(true)
    setScanProgress(0)
    setCancelConfirm(false)
    setActivityState(prev => [{ action: 'Scan started', timestamp: 'Just now', user: 'Zane F.', type: 'scan' as const }, ...prev])

    scanTimer.current = setInterval(() => {
      let done = false
      setScanProgress(prev => {
        const next = prev + 10 + Math.random() * 15
        if (next < 100) return next
        done = true
        return 100
      })
      if (!done) return

      clearInterval(scanTimer.current!)
      scanTimer.current = null

      const { findings: nextFindings, comparison: nextComparison } = generateRescanResult(findingsState, lastScanAt)
      setFindingsState(nextFindings)
      setComparison(nextComparison)
      setScanning(false)
      setLastScanAt('Just now')
      setResolvedSectionOpen(false)

      const openFindings = nextFindings.filter(f => f.status === 'open')
      const hasCritOrHigh = openFindings.some(f => f.severity === 'critical' || f.severity === 'high')
      const status = hasCritOrHigh ? 'fail' : 'pass'
      setActivityState(prevActivity => [{ action: `Scan completed — ${openFindings.length} findings detected`, timestamp: 'Just now', user: 'Zane F.', type: 'scan' as const }, ...prevActivity])
      toast(`Scan complete — ${slug} (${status}, ${openFindings.length} findings)`)

      if (repoEntry) {
        setRepos(prev => prev.map(r => r.id === repoEntry.id ? {
          ...r,
          scanner: { status, readiness: r.scanner.readiness, findings_count: openFindings.length, last_scan_at: 'Just now', last_scan_by: 'Zane F.' },
          last_activity: { type: 'scan' as const, timestamp: 'Just now', by: 'Zane F.' },
        } : r))
      }
    }, 400)
  }, [scanning, findingsState, lastScanAt, slug, toast, repoEntry, setRepos])

  const handleCancelScan = useCallback(() => {
    if (scanTimer.current) { clearInterval(scanTimer.current); scanTimer.current = null }
    setScanning(false)
    setScanProgress(0)
    setCancelConfirm(false)
    toast('Scan cancelled')
  }, [toast])

  const clearComparison = useCallback(() => setComparison(null), [])

  const findingBadge = useMemo(() => {
    const map: Record<string, 'new' | 'changed'> = {}
    if (comparison) {
      comparison.new_findings.forEach(id => { map[id] = 'new' })
      comparison.changed_findings.forEach(c => { map[c.finding_id] = 'changed' })
    }
    return map
  }, [comparison])

  useEffect(() => {
    if (cached?.enrichmentStates) return
    const states: Record<string, EnrichmentState> = {}
    data.findings.forEach(f => { states[f.id] = f.enriched ? 'enriched' : 'none' })
    setEnrichmentStates(states)
    return () => { Object.values(enrichTimers.current).forEach(clearInterval) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getEnrichState = (id: string): EnrichmentState => enrichmentStates[id] || 'none'

  const beginEnrichSimulation = useCallback((findingId: string) => {
    setEnrichmentStates(prev => ({ ...prev, [findingId]: 'enriching' }))
    setEnrichmentProgress(prev => ({ ...prev, [findingId]: 0 }))
    const willFail = Math.random() < 0.15
    let step = 0
    const interval = setInterval(() => {
      step++
      if (willFail && step === 3) {
        clearInterval(interval); delete enrichTimers.current[findingId]
        setEnrichmentStates(prev => ({ ...prev, [findingId]: 'failed' })); return
      }
      if (step < 4) { setEnrichmentProgress(prev => ({ ...prev, [findingId]: step })) }
      else {
        clearInterval(interval); delete enrichTimers.current[findingId]
        setEnrichmentStates(prev => ({ ...prev, [findingId]: 'enriched' }))
        setFindingsState(prev => prev.map(f => {
          if (f.id !== findingId) return f
          return { ...f, enriched: true, ...generateMockEnrichment(f) }
        }))
      }
    }, 1200)
    enrichTimers.current[findingId] = interval
  }, [])

  const { run: runEnrichWithChecks, checking: checkingEnrich, modals: enrichPreflightModals } = useEnrichPreflight(beginEnrichSimulation)

  const enrichSelected = useCallback(() => {
    selectedFindings.forEach(id => {
      const f = findingsState.find(fi => fi.id === id)
      const state = getEnrichState(id)
      if (f && (state === 'none' || state === 'failed') && canEnrich(f)) runEnrichWithChecks(id)
    })
  }, [selectedFindings, enrichmentStates, findingsState, runEnrichWithChecks]) // eslint-disable-line react-hooks/exhaustive-deps

  const ignoreSelected = useCallback(() => {
    setFindingsState(prev => prev.map(f =>
      selectedFindings.has(f.id) && f.status === 'open' ? { ...f, status: 'ignored' as const } : f
    ))
    setSelectedFindings(new Set())
  }, [selectedFindings])

  const toggleFindingSelect = (id: string) => {
    setSelectedFindings(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    findingsState.forEach(f => { if (f.status === 'open') counts[f.severity]++ })
    return counts
  }, [findingsState])

  const filteredFindings = useMemo(() => {
    let base = findingsState
    if (findingsSearch) {
      const q = findingsSearch.toLowerCase()
      base = base.filter(f => f.title.toLowerCase().includes(q) || f.location.toLowerCase().includes(q))
    }
    if (activeFilters.length === 0) return [...base].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    const activeScopes = activeFilters.filter(f => ['agent', 'skill', 'tool'].includes(f))
    const activeSeverities = activeFilters.filter(f => ['critical', 'high', 'medium', 'low'].includes(f))
    const showResolved = activeFilters.includes('resolved')
    const showIgnored = activeFilters.includes('ignored')
    const showEnrichable = activeFilters.includes('enrichable')
    const showEnriched = activeFilters.includes('enriched')
    const showNew = activeFilters.includes('cmp:new')
    const showChanged = activeFilters.includes('cmp:changed')
    const showUnchanged = activeFilters.includes('cmp:unchanged')
    const anyComparisonFilter = showNew || showChanged || showUnchanged
    const list = base.filter(f => {
      if (activeScopes.length && !activeScopes.includes(f.scope)) return false
      if (activeSeverities.length && !activeSeverities.includes(f.severity)) return false
      if (showResolved || showIgnored) {
        if (showResolved && f.status === 'resolved') return true
        if (showIgnored && f.status === 'ignored') return true
        if (!activeScopes.length && !activeSeverities.length && !showEnrichable && !showEnriched && !anyComparisonFilter) return false
      }
      if (showEnrichable || showEnriched) {
        const eState = getEnrichState(f.id)
        if (showEnrichable && canEnrich(f) && eState !== 'enriching') return true
        if (showEnriched && eState === 'enriched') return true
        if (!activeScopes.length && !activeSeverities.length && !showResolved && !showIgnored && !anyComparisonFilter) return false
      }
      if (anyComparisonFilter) {
        const badge = findingBadge[f.id]
        if (showNew && badge === 'new') return true
        if (showChanged && badge === 'changed') return true
        if (showUnchanged && !badge && comparison?.unchanged_findings.includes(f.id)) return true
        if (!activeScopes.length && !activeSeverities.length && !showResolved && !showIgnored && !showEnrichable && !showEnriched) return false
      }
      return true
    })
    return list.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
  }, [findingsState, activeFilters, enrichmentStates, findingsSearch, findingBadge, comparison]) // eslint-disable-line react-hooks/exhaustive-deps

  const findingsTotalPages = Math.max(1, Math.ceil(filteredFindings.length / pageSize))
  const paginatedFindings = filteredFindings.slice((findingsPage - 1) * pageSize, findingsPage * pageSize)

  const updateFindingStatus = (fId: string, status: 'resolved' | 'ignored') => {
    setFindingsState(prev => prev.map(f => f.id === fId ? { ...f, status } : f))
  }

  const allPageSelected = paginatedFindings.length > 0 && paginatedFindings.every(f => selectedFindings.has(f.id))
  const somePageSelected = paginatedFindings.some(f => selectedFindings.has(f.id))

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedFindings(prev => { const next = new Set(prev); paginatedFindings.forEach(f => next.delete(f.id)); return next })
    } else {
      setSelectedFindings(prev => { const next = new Set(prev); paginatedFindings.forEach(f => next.add(f.id)); return next })
    }
  }

  // ─── Autofix state (check session cache, then repo table status) ───
  const [afInit] = useState(() => {
    if (cached?.afPageState === 'results' && cached.afFindings) return cached
    const afStatus = repoEntry?.autofix.status
    if (afStatus === 'ready' || afStatus === 'all_applied') {
      const session = getAutofixSession(slug)
      if (session) {
        const findings = session.findings.map(f => ({ ...f, fix_status: 'ready' as FixStatus, applied_at: undefined, applied_by: undefined, rejected_at: undefined, rejected_by: undefined }))
        return { afPageState: 'results' as AutofixPageState, afSession: session, afFindings: findings, attestation: generateAttestation(slug, session.id) }
      }
    }
    if (afStatus === 'running') return { afPageState: 'running' as AutofixPageState, afSession: null, afFindings: [], attestation: null }
    return null
  })
  const [afPageState, setAfPageState] = useState<AutofixPageState>(afInit?.afPageState ?? cached?.afPageState ?? 'empty')
  const [afSession, setAfSession] = useState<AutofixSession | null>(afInit?.afSession ?? cached?.afSession ?? null)
  const [afFindings, setAfFindings] = useState<AutofixFinding[]>(afInit?.afFindings ?? cached?.afFindings ?? [])
  const [afFilters, setAfFilters] = useState<string[]>(cached?.afFilters ?? [])
  const [afSubTab, setAfSubTab] = useState<'findings' | 'activity'>(cached?.afSubTab ?? 'findings')
  const [afFindingsSearch, setAfFindingsSearch] = useState(cached?.afFindingsSearch ?? '')
  const [afFindingsPage, setAfFindingsPage] = useState(1)
  const [afPageSize, setAfPageSize] = useState(10)
  const [afExpandedFinding, setAfExpandedFinding] = useState<string | null>(null)
  const [afSelectedFindings, setAfSelectedFindings] = useState<Set<string>>(new Set())
  const [attestation, setAttestation] = useState<AttestationData | null>(afInit?.attestation ?? cached?.attestation ?? null)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [afRunStep, setAfRunStep] = useState(0)
  const [afFindingProgress, setAfFindingProgress] = useState<Record<string, number>>({})
  const afRunTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { return () => { if (afRunTimer.current) clearInterval(afRunTimer.current) } }, [])

  // ─── Sync session on unmount ───
  const stateRef = useRef({ findingsState, enrichmentStates, enrichmentProgress, activeFilters, findingsSearch, activeSubTab, activityState, lastScanAt, comparison, afPageState, afSession, afFindings, afFilters, afSubTab, afFindingsSearch, attestation })
  useEffect(() => {
    stateRef.current = { findingsState, enrichmentStates, enrichmentProgress, activeFilters, findingsSearch, activeSubTab, activityState, lastScanAt, comparison, afPageState, afSession, afFindings, afFilters, afSubTab, afFindingsSearch, attestation }
  })
  useEffect(() => {
    return () => { updateSession(slug, stateRef.current) }
  }, [slug, updateSession])


  const beginAutofixSimulation = useCallback(() => {
    setAfPageState('running'); setAfRunStep(0); setAfFindingProgress({})
    if (repoEntry) {
      setRepos(prev => prev.map(r => r.id === repoEntry.id ? {
        ...r,
        autofix: { ...r.autofix, status: 'running' as const, last_run_at: 'In progress', last_run_by: 'Zane F.' },
        last_activity: { type: 'autofix' as const, timestamp: 'In progress', by: 'Zane F.' },
      } : r))
    }
    let step = 0
    afRunTimer.current = setInterval(() => {
      step++
      if (step < AUTOFIX_STEPS.length) { setAfRunStep(step) }
      else {
        if (afRunTimer.current) clearInterval(afRunTimer.current)
        let fixesReady = 6
        const existingSession = getAutofixSession(slug)
        if (existingSession) {
          const newFindings = existingSession.findings
          fixesReady = newFindings.length
          setAfSession({ ...existingSession, status: 'completed', created_at: 'Just now', created_by: 'Zane F.' })
          setAfFindings(newFindings)
        } else {
          const mockFindings: AutofixFinding[] = Array.from({ length: 6 }, (_, i) => ({
            finding_id: `af-${slug}-gen-${i}`, rule_id: `CAGENT-0${50 + i}`,
            severity: ['critical', 'warning', 'info'][i % 3],
            title: ['No error handling on LLM calls', 'Missing input validation', 'No retry mechanism', 'Hardcoded configuration', 'Missing structured logging', 'No rate limiting'][i],
            scope: ['agent', 'skill', 'tool'][i % 3], tool_name: ['agent-lint', 'prompt-guard', 'semgrep'][i % 3],
            file_path: `src/${['agent', 'skill', 'tool'][i % 3]}s/main.ts`, start_line: 10 + i * 15, end_line: 18 + i * 15, fix_status: 'ready' as FixStatus,
            code_snippet: `// Current implementation\nfunction handle() {\n  return process(input)\n}`,
            replacement: `// Fixed implementation\nfunction handle() {\n  const validated = validate(input)\n  try {\n    return process(validated)\n  } catch (err) {\n    logger.error(err)\n    return fallback(err)\n  }\n}`,
            ai_fix: 'Apply input validation and error handling with proper fallback behavior.',
          }))
          setAfSession({ id: `ses_${slug.slice(0, 6)}_new`, repo_id: slug, repo_name: slug, scan_id: `scn_${slug.slice(0, 8)}`, status: 'completed', created_at: 'Just now', created_by: 'Zane F.', findings: mockFindings })
          setAfFindings(mockFindings)
        }
        setAfPageState('results')
        setAttestation(generateAttestation(slug, `ses_${slug.slice(0, 6)}_new`))
        toast('Autofix complete')
        if (repoEntry) {
          setRepos(prev => prev.map(r => r.id === repoEntry.id ? {
            ...r,
            autofix: { status: 'ready' as const, fix_readiness: 0, fixes_ready: fixesReady, fixes_applied: 0, fixes_total: fixesReady, last_run_at: 'Just now', last_run_by: 'Zane F.' },
            last_activity: { type: 'autofix' as const, timestamp: 'Just now', by: 'Zane F.' },
          } : r))
        }
      }
    }, 1500)
  }, [slug, toast, repoEntry, setRepos])

  const { run: runAutofixWithChecks, checking: checkingAutofix, modals: autofixPreflightModals } = useAutofixPreflight(beginAutofixSimulation)

  // Resume the running-state animation if the table already shows autofix in progress for this repo.
  useEffect(() => {
    if (repoEntry?.autofix.status === 'running' && afPageState === 'running' && !afRunTimer.current) {
      beginAutofixSimulation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const acceptFix = useCallback((id: string) => {
    setAfFindings(prev => prev.map(f => f.finding_id === id ? { ...f, fix_status: 'applied' as FixStatus, applied_at: 'Just now', applied_by: 'Zane F.' } : f))
  }, [])
  const rejectFix = useCallback((id: string) => {
    setAfFindings(prev => prev.map(f => f.finding_id === id ? { ...f, fix_status: 'rejected' as FixStatus, rejected_at: 'Just now', rejected_by: 'Zane F.' } : f))
  }, [])
  const reconsiderFix = useCallback((id: string) => {
    setAfFindings(prev => prev.map(f => f.finding_id === id ? { ...f, fix_status: 'ready' as FixStatus, rejected_at: undefined, rejected_by: undefined } : f))
  }, [])
  const afBulkAccept = useCallback(() => {
    setAfFindings(prev => prev.map(f => afSelectedFindings.has(f.finding_id) && f.fix_status === 'ready' ? { ...f, fix_status: 'applied' as FixStatus, applied_at: 'Just now', applied_by: 'Zane F.' } : f))
    toast(`${afSelectedFindings.size} fixes accepted`); setAfSelectedFindings(new Set())
  }, [afSelectedFindings, toast])
  const afBulkReject = useCallback(() => {
    setAfFindings(prev => prev.map(f => afSelectedFindings.has(f.finding_id) && f.fix_status === 'ready' ? { ...f, fix_status: 'rejected' as FixStatus, rejected_at: 'Just now', rejected_by: 'Zane F.' } : f))
    toast(`${afSelectedFindings.size} fixes rejected`); setAfSelectedFindings(new Set())
  }, [afSelectedFindings, toast])
  const handleExportPatch = useCallback(() => { toast('Patch file downloaded') }, [toast])
  const handleRerun = useCallback(() => {
    setAfFindings([]); setAfSession(null); setAfSelectedFindings(new Set()); setAfExpandedFinding(null); setAfFilters([]); runAutofixWithChecks(slug)
  }, [runAutofixWithChecks, slug])

  const handleDownloadPolicy = useCallback(() => {
    if (!attestation) return
    const blob = new Blob([attestation.policy.content], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = attestation.policy.filename; a.click()
    URL.revokeObjectURL(url); toast('Policy downloaded')
  }, [attestation, toast])

  const handleCopyPolicy = useCallback(() => {
    if (!attestation) return
    navigator.clipboard.writeText(attestation.policy.content); toast('Copied to clipboard')
  }, [attestation, toast])

  const afFilteredFindings = useMemo(() => {
    let list = afFindings
    if (afFindingsSearch) {
      const q = afFindingsSearch.toLowerCase()
      list = list.filter(f => f.title.toLowerCase().includes(q) || f.file_path.toLowerCase().includes(q))
    }
    if (afFilters.length > 0) {
      const statusFilters = afFilters.filter(f => !f.startsWith('cat:'))
      const catFilters = afFilters.filter(f => f.startsWith('cat:')).map(f => f.slice(4))
      if (statusFilters.length > 0) list = list.filter(f => statusFilters.includes(f.fix_status))
      if (catFilters.length > 0) {
        const runtimeTools = ['agent-lint', 'prompt-guard']
        list = list.filter(f => {
          const isRuntime = runtimeTools.includes(f.tool_name)
          if (catFilters.includes('runtime') && isRuntime) return true
          if (catFilters.includes('static') && !isRuntime) return true
          return false
        })
      }
    }
    return list
  }, [afFindings, afFilters, afFindingsSearch])

  const afTotalPages = Math.max(1, Math.ceil(afFilteredFindings.length / afPageSize))
  const afPaginatedFindings = afFilteredFindings.slice((afFindingsPage - 1) * afPageSize, afFindingsPage * afPageSize)

  const afToggleSelect = (id: string) => {
    setAfSelectedFindings(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const afAllSelected = afPaginatedFindings.length > 0 && afPaginatedFindings.every(f => afSelectedFindings.has(f.finding_id))
  const afSomeSelected = afPaginatedFindings.some(f => afSelectedFindings.has(f.finding_id))
  const afToggleSelectAll = () => {
    if (afAllSelected) { setAfSelectedFindings(prev => { const next = new Set(prev); afPaginatedFindings.forEach(f => next.delete(f.finding_id)); return next }) }
    else { setAfSelectedFindings(prev => { const next = new Set(prev); afPaginatedFindings.forEach(f => next.add(f.finding_id)); return next }) }
  }

  const afSummary = useMemo(() => {
    const total = afFindings.length
    const ready = afFindings.filter(f => f.fix_status === 'ready').length
    const running = afFindings.filter(f => f.fix_status === 'running').length
    const applied = afFindings.filter(f => f.fix_status === 'applied').length
    const rejected = afFindings.filter(f => f.fix_status === 'rejected').length
    return { total, ready, running, applied, rejected }
  }, [afFindings])

  const afScopeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    afFindings.forEach(f => { counts[f.scope] = (counts[f.scope] || 0) + 1 })
    return counts
  }, [afFindings])

  // ─── Render ───
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top-level tabs — pinned below nav */}
      <div className="flex-shrink-0 [&>div]:px-6">
        <Tabs
          tabs={[
            { label: 'Scanner', value: 'analysis', icon: ScanSearch },
            { label: 'Autofix', value: 'autofix', icon: Wand2 },
          ]}
          value={topTab}
          onChange={(v) => {
            if (v === 'autofix' && !autofixEnabled) { setGateModal('autofix'); return }
            setTopTab(v as 'analysis' | 'autofix')
          }}
        />
      </div>

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-10 pb-6 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full flex flex-col gap-4">

        {/* ════════════════════════════════════════════════
            STATIC ANALYSIS TAB
            ════════════════════════════════════════════════ */}
        {topTab === 'analysis' && (
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">

              {/* Score strip */}
              <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-5">
                <div className="flex items-center gap-5">
                  <CircularScore value={data.repo.readiness_score} />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{data.repo.name}</h2>
                      <Badge variant={data.repo.gate_status === 'pass' ? 'success' : 'danger'} size="sm">
                        {data.repo.gate_status === 'pass' ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {data.repo.framework} · {data.repo.language} · Last scan {lastScanAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" icon={scanning ? undefined : RefreshCw} loading={scanning} disabled={scanning} onClick={handleRescan}>{scanning ? 'Scanning...' : 'Re-scan'}</Button>
                  <Button variant="secondary" icon={Download}>Export</Button>
                </div>
              </div>

              {/* Scanning overlay */}
              {scanning && (
                <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4">
                  <div className="h-1 w-full rounded-full bg-[var(--color-bg-raised)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-accent-default)] transition-[width] duration-300" style={{ width: `${Math.min(scanProgress, 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Spinner size="sm" variant="accent" className="flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">Scanning in progress...</span>
                        <span className="text-xs text-[var(--color-text-tertiary)]">Results will update when complete. You&apos;ll be notified when done.</span>
                      </div>
                    </div>
                    {cancelConfirm ? (
                      <div className="flex items-center gap-2 text-xs flex-shrink-0">
                        <span className="text-[var(--color-text-tertiary)]">Cancel scan?</span>
                        <button className="font-medium text-[var(--color-danger-text)] hover:underline" onClick={handleCancelScan}>Yes, cancel</button>
                        <button className="font-medium text-[var(--color-text-secondary)] hover:underline" onClick={() => setCancelConfirm(false)}>Keep scanning</button>
                      </div>
                    ) : (
                      <button className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] flex-shrink-0" onClick={() => setCancelConfirm(true)}>Cancel scan</button>
                    )}
                  </div>
                </div>
              )}

              {/* Comparison summary bar */}
              {comparison && !scanning && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--color-text-secondary)]">Compared to previous scan ({comparison.previous_scan_at})</span>
                    <div className="flex items-center gap-1.5">
                      {comparison.new_findings.length > 0 && <Badge variant="info" size="sm">+{comparison.new_findings.length} new</Badge>}
                      {comparison.fixed_findings.length > 0 && <Badge variant="success" size="sm">−{comparison.fixed_findings.length} fixed</Badge>}
                      {comparison.changed_findings.length > 0 && <Badge variant="warning" size="sm">~{comparison.changed_findings.length} changed</Badge>}
                      <Badge variant="neutral" size="sm">{comparison.unchanged_findings.length} unchanged</Badge>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]" onClick={clearComparison}>Clear comparison</button>
                </div>
              )}

              {/* Sub tabs */}
              <div className="flex items-center justify-between">
                <Tabs
                  tabs={[
                    { label: 'Findings', value: 'findings', badge: findingsState.length },
                    { label: 'Surfaces', value: 'surfaces', badge: data.surfaces.length },
                    { label: 'Activity', value: 'activity', badge: activityState.length },
                  ]}
                  value={activeSubTab}
                  onChange={(v) => setActiveSubTab(v as typeof activeSubTab)}
                  variant="pill"
                />
                {activeSubTab === 'findings' && (
                  <div className="flex items-center gap-2">
                  <div className="w-[200px]">
                    <InputField label="" iconLeft={Search} value={findingsSearch} onChange={(e) => { setFindingsSearch(e.target.value); setFindingsPage(1) }} placeholder="Search findings..." />
                  </div>
                  <Dropdown
                    type="multi" placeholder="Filter" align="right"
                    triggerLabel={activeFilters.length === 0 ? 'Filter' : `Filter (${activeFilters.length})`}
                    triggerIcon={<Filter size={14} className="text-[var(--color-text-tertiary)]" />}
                    hideChevron
                    options={[
                      { label: 'Agent', value: 'agent', group: 'Surface' }, { label: 'Skill', value: 'skill', group: 'Surface' }, { label: 'Tool', value: 'tool', group: 'Surface' },
                      { label: 'Critical', value: 'critical', group: 'Severity' }, { label: 'High', value: 'high', group: 'Severity' }, { label: 'Medium', value: 'medium', group: 'Severity' }, { label: 'Low', value: 'low', group: 'Severity' },
                      { label: 'Enrichable', value: 'enrichable', group: 'Enrichment' }, { label: 'Enriched', value: 'enriched', group: 'Enrichment' },
                      { label: 'Resolved', value: 'resolved', group: 'Status' }, { label: 'Ignored', value: 'ignored', group: 'Status' },
                      ...(comparison ? [
                        { label: 'New', value: 'cmp:new', group: 'Comparison' },
                        { label: 'Changed', value: 'cmp:changed', group: 'Comparison' },
                        { label: 'Unchanged', value: 'cmp:unchanged', group: 'Comparison' },
                      ] : []),
                    ]}
                    value={activeFilters}
                    onChange={(v) => { setActiveFilters(v as string[]); setFindingsPage(1) }}
                  />
                  </div>
                )}
              </div>

              {/* Findings tab */}
              {activeSubTab === 'findings' && (
                <div className="flex flex-col gap-3">
                  {selectedFindings.size > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border-focus)] bg-[var(--color-bg-surface)]">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{selectedFindings.size} selected</span>
                      <div className="w-px h-4 bg-[var(--color-border-muted)]" />
                      <Button variant="secondary" size="sm" icon={Sparkles} onClick={enrichSelected}>Enrich</Button>
                      <Button variant="secondary" size="sm" icon={CheckCircle} onClick={() => { setFindingsState(prev => prev.map(f => selectedFindings.has(f.id) && f.status === 'open' ? { ...f, status: 'resolved' as const } : f)); setSelectedFindings(new Set()) }}>Resolve</Button>
                      <Button variant="secondary" size="sm" icon={EyeOff} onClick={ignoreSelected}>Ignore</Button>
                      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { toast(`Re-scanning ${selectedFindings.size} findings`); setSelectedFindings(new Set()) }}>Re-scan</Button>
                      <Button variant="text" size="sm" onClick={() => setSelectedFindings(new Set())}>Deselect all</Button>
                    </div>
                  )}

                  {paginatedFindings.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
                      {findingsState.length === 0 ? (
                        <>
                          <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
                            <CheckCircle size={24} className="text-[var(--color-success-text)]" />
                          </div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">No findings detected</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">This repository passed all checks</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
                            <Filter size={24} className="text-[var(--color-text-tertiary)]" />
                          </div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">No matching findings</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Try adjusting your filters</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                    {scanning && (
                      <p className="text-xs text-[var(--color-text-tertiary)]">Showing results from previous scan — {lastScanAt}</p>
                    )}
                    <div className={['flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)] transition-opacity', scanning ? 'opacity-60 pointer-events-none' : ''].filter(Boolean).join(' ')}>
                      <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-raised)] border-b border-[var(--color-border-muted)] rounded-t-[var(--radius-base)]">
                        <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleSelectAll} />
                        <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">{allPageSelected ? 'Deselect all' : 'Select all'}</span>
                      </div>
                      {paginatedFindings.map(finding => {
                        const isExpanded = expandedFinding === finding.id
                        const isDimmed = finding.status === 'resolved' || finding.status === 'ignored'
                        const eState = getEnrichState(finding.id)
                        const isSelected = selectedFindings.has(finding.id)
                        const badge = findingBadge[finding.id]
                        const changedInfo = comparison?.changed_findings.find(c => c.finding_id === finding.id)
                        return (
                          <div key={finding.id} className={['border-b border-[var(--color-border-muted)] last:border-b-0 last:rounded-b-[var(--radius-base)]', isDimmed ? 'opacity-50' : ''].filter(Boolean).join(' ')}>
                            <div className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-[var(--color-bg-surface)] transition-colors">
                              <div onClick={(e) => e.stopPropagation()}><Checkbox checked={isSelected} onChange={() => toggleFindingSelect(finding.id)} /></div>
                              <button onClick={() => setExpandedFinding(isExpanded ? null : finding.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                <span className="text-[11px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: severityStyles[finding.severity].color }}>{severityStyles[finding.severity].label}</span>
                                <div className="w-px h-4 bg-[var(--color-border-muted)] flex-shrink-0" />
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{finding.title}</span>
                                  <Badge variant="neutral" size="sm">{finding.scope}</Badge>
                                </div>
                                {badge === 'new' && <Badge variant="info" size="sm">New</Badge>}
                                {badge === 'changed' && <Badge variant="warning" size="sm">Changed</Badge>}
                                {eState === 'enriching' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-accent-subtle)] text-[11px] font-medium text-[var(--color-accent-default)]">
                                    <Spinner size="sm" className="w-[10px] h-[10px]" />Enriching...
                                  </span>
                                ) : (
                                  <>
                                    <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono hidden sm:block">{finding.location}</code>
                                    {eState === 'enriched' && <Badge variant="success" size="sm">Enriched</Badge>}
                                    {eState === 'failed' && <Badge variant="danger" size="sm">Failed</Badge>}
                                    {finding.status !== 'open' && <Badge variant={finding.status === 'resolved' ? 'success' : 'neutral'} size="sm">{finding.status}</Badge>}
                                  </>
                                )}
                                <ChevronDown size={14} className={['text-[var(--color-text-tertiary)] transition-transform', isExpanded ? 'rotate-180' : ''].join(' ')} />
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="px-4 pb-4 flex flex-col gap-4 bg-[var(--color-bg-surface)]">
                                <div className="flex flex-col gap-1.5 pt-2">
                                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Policy ID</p>
                                  <p className="text-sm text-[var(--color-text-primary)]">{finding.policyId}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">What&apos;s wrong</p>
                                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{finding.description}</p>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Suggested fix</p>
                                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{finding.fix}</p>
                                  </div>
                                </div>
                                {changedInfo && (
                                  <div className="rounded-[var(--radius-base)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] px-3 py-2.5 flex items-center gap-2.5">
                                    <AlertTriangle size={14} className="text-[var(--color-warning-text)] flex-shrink-0" />
                                    <span className="text-sm text-[var(--color-warning-text)]">
                                      Was {severityStyles[changedInfo.previous_severity].label} → now {severityStyles[changedInfo.current_severity].label}
                                    </span>
                                  </div>
                                )}
                                {eState === 'none' && !canEnrich(finding) && (
                                  <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                                    <Info size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                                    <span className="text-sm text-[var(--color-text-tertiary)]">Cannot be enriched — requires manual refactoring first</span>
                                  </div>
                                )}
                                {eState === 'enriching' && (
                                  <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] p-3 flex flex-col gap-2">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Enriching</p>
                                    {ENRICHMENT_STEPS.map((step, i) => {
                                      const progress = enrichmentProgress[finding.id] ?? 0
                                      const isActive = i === progress; const isDone = i < progress
                                      return (
                                        <div key={i} className="flex items-center gap-2.5">
                                          {isDone ? <CheckCircle size={14} className="text-[var(--color-success-text)] flex-shrink-0" /> : isActive ? <Spinner size="sm" className="flex-shrink-0" /> : <Circle size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />}
                                          <span className={['text-sm', isActive ? 'text-[var(--color-text-primary)]' : isDone ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-tertiary)]'].join(' ')}>
                                            {step}{isActive && i === 0 ? ` (${finding.policyId})` : ''}{isActive && i === 1 ? ` — ${finding.tool_name}` : ''}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                                {eState === 'failed' && (
                                  <div className="rounded-[var(--radius-base)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] px-3 py-2.5 flex items-center gap-2.5">
                                    <AlertTriangle size={14} className="text-[var(--color-danger-text)] flex-shrink-0" />
                                    <span className="text-sm text-[var(--color-danger-text)]">Enrichment failed. Check your LLM configuration in Settings and try again.</span>
                                  </div>
                                )}
                                {eState === 'enriched' && finding.enriched && (
                                  <>
                                    <div className="flex items-center gap-3 pt-1">
                                      <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Enrichment Details</p>
                                      <div className="flex-1 h-px bg-[var(--color-border-muted)]" />
                                    </div>
                                    {finding.ai_explanation && (
                                      <div className="flex flex-col gap-1.5">
                                        <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">AI Explanation</p>
                                        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">{finding.ai_explanation}</p>
                                      </div>
                                    )}
                                    {finding.code_snippet && finding.replacement && (
                                      <div className="flex flex-col gap-1.5">
                                        <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p>
                                        <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden font-mono text-xs">
                                          <div className="bg-[var(--color-danger-bg)] px-3 py-2.5 border-b border-[var(--color-border-muted)]">
                                            <span className="font-sans text-[10px] font-semibold text-[var(--color-danger-text)] uppercase tracking-wide">Remove</span>
                                            <pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.code_snippet}</pre>
                                          </div>
                                          <div className="bg-[var(--color-success-bg)] px-3 py-2.5">
                                            <span className="font-sans text-[10px] font-semibold text-[var(--color-success-text)] uppercase tracking-wide">Add</span>
                                            <pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.replacement}</pre>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                                {finding.status === 'open' && eState !== 'enriching' && (
                                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border-muted)]">
                                    {eState === 'none' && canEnrich(finding) && (
                                      <Tooltip content="Generate AI explanation, code fix, and diff" position="bottom">
                                        <Button variant="primary" size="sm" icon={Sparkles} loading={checkingEnrich} onClick={() => runEnrichWithChecks(finding.id)}>
                                          {checkingEnrich ? 'Checking...' : 'Enrich'}
                                        </Button>
                                      </Tooltip>
                                    )}
                                    {eState === 'failed' && (
                                      <Tooltip content="Retry enrichment" position="bottom">
                                        <Button variant="primary" size="sm" icon={RotateCcw} loading={checkingEnrich} onClick={() => runEnrichWithChecks(finding.id)}>Retry</Button>
                                      </Tooltip>
                                    )}
                                    <Tooltip content="Mark as fixed externally — re-scan will verify" position="bottom">
                                      <Button variant="secondary" size="sm" icon={CheckCircle} onClick={() => updateFindingStatus(finding.id, 'resolved')}>Resolve</Button>
                                    </Tooltip>
                                    <Tooltip content="Dismiss this finding — won't fix" position="bottom">
                                      <Button variant="secondary" size="sm" icon={EyeOff} onClick={() => updateFindingStatus(finding.id, 'ignored')}>Ignore</Button>
                                    </Tooltip>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    </>
                  )}
                  {comparison && comparison.fixed_findings.length > 0 && (
                    <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden">
                      <button
                        onClick={() => setResolvedSectionOpen(o => !o)}
                        className="flex items-center justify-between w-full px-4 py-2.5 bg-[var(--color-bg-raised)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-colors"
                      >
                        <span>{comparison.fixed_findings.length} finding{comparison.fixed_findings.length > 1 ? 's' : ''} resolved since last scan</span>
                        <ChevronDown size={14} className={['text-[var(--color-text-tertiary)] transition-transform', resolvedSectionOpen ? 'rotate-180' : ''].join(' ')} />
                      </button>
                      {resolvedSectionOpen && comparison.fixed_findings.map(f => (
                        <div key={f.id} className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border-muted)] opacity-50">
                          <span className="text-[11px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: severityStyles[f.severity].color }}>{severityStyles[f.severity].label}</span>
                          <div className="w-px h-4 bg-[var(--color-border-muted)] flex-shrink-0" />
                          <span className="text-sm text-[var(--color-text-primary)] line-through flex-1 truncate">{f.title}</span>
                          <Badge variant="success" size="sm">Fixed</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredFindings.length > pageSize && (
                    <Pagination currentPage={findingsPage} totalPages={findingsTotalPages} totalItems={filteredFindings.length} pageSize={pageSize} pageSizeOptions={PAGE_SIZE_OPTIONS} onPageChange={setFindingsPage} onPageSizeChange={(size) => { setPageSize(size); setFindingsPage(1) }} />
                  )}
                </div>
              )}

              {/* Surfaces tab */}
              {activeSubTab === 'surfaces' && (
                <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden">
                  {data.surfaces.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12"><p className="text-sm text-[var(--color-text-tertiary)]">No surfaces detected</p></div>
                  ) : (
                    data.surfaces.map(surface => (
                      <div key={surface.path} className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-muted)] last:border-b-0 hover:bg-[var(--color-bg-surface)] transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{surface.name}</p>
                            <Badge variant="neutral" size="sm">{surface.type}</Badge>
                          </div>
                          <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{surface.path}</code>
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)]">{surface.findings_count} findings</span>
                        <div className="w-px h-4 bg-[var(--color-border-muted)]" />
                        <span className="text-xs font-medium" style={{ color: readinessColor(surface.readiness) }}>{surface.readiness}%</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Activity tab */}
              {activeSubTab === 'activity' && (
                <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden px-5 py-4">
                  {activityState.map((item, i) => {
                    const iconMap = { scan: Shield, fix: CheckCircle, ignore: EyeOff, add: Circle }
                    const Icon = iconMap[item.type]
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center flex-shrink-0"><Icon size={12} className="text-[var(--color-text-tertiary)]" /></div>
                          {i < activityState.length - 1 && <div className="w-px flex-1 bg-[var(--color-border-muted)] my-1" />}
                        </div>
                        <div className={i < activityState.length - 1 ? 'pb-4' : ''}>
                          <p className="text-sm text-[var(--color-text-primary)]">{item.action}</p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.timestamp} · {item.user}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Analysis sidebar */}
            <div className="w-[280px] flex-shrink-0 sticky top-0 flex flex-col gap-4">
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Scan Info</p>
                <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                  <div className="flex justify-between"><span>Scan ID</span><code className="text-[var(--color-text-primary)] font-mono text-[11px]">{data.scan.id}</code></div>
                  <div className="flex justify-between"><span>Run time</span><span className="text-[var(--color-text-primary)]">{lastScanAt}</span></div>
                  <div className="flex justify-between"><span>Run by</span><span className="text-[var(--color-text-primary)]">{activityState.find(a => a.type === 'scan')?.user ?? '—'}</span></div>
                </div>
              </div>
              {findingsState.length > 0 && (
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Readiness</p>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Current</span><span className="text-xs font-medium" style={{ color: readinessColor(data.scan.readiness_fix_critical) }}>{data.scan.readiness_fix_critical}%</span></div>
                      <ProgressBar value={data.scan.readiness_fix_critical} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between"><span className="text-xs text-[var(--color-text-secondary)]">After fixes</span><span className="text-xs font-medium" style={{ color: readinessColor(data.scan.readiness_fix_all) }}>{data.scan.readiness_fix_all}%</span></div>
                      <ProgressBar value={data.scan.readiness_fix_all} />
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Rule Provenance</p>
                <div className="flex flex-col gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <div className="flex justify-between"><span>Source</span><span className="text-[var(--color-text-primary)]">trustabl/core</span></div>
                  <div className="flex justify-between"><span>Version</span><span className="text-[var(--color-text-primary)]">v2.4.1</span></div>
                  <div className="flex justify-between"><span>Origin</span><span className="text-[var(--color-text-primary)]">static-analysis</span></div>
                  <div className="flex justify-between"><span>Policy</span><span className="text-[var(--color-text-primary)]">ai-agent, security</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            AUTOFIX TAB
            ════════════════════════════════════════════════ */}
        {topTab === 'autofix' && (
          <>
            {/* Empty state */}
            {afPageState === 'empty' && (
              <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-[640px] flex flex-col items-center gap-8">

                  {/* Icon with radial glow */}
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div className="relative flex items-center justify-center">
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: 180,
                          height: 180,
                          background: 'radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        className="relative w-16 h-16 rounded-[var(--radius-card)] flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-ai-bg)' }}
                      >
                        <Wand2 size={28} style={{ color: 'var(--color-ai-text)' }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Autofix is ready to run</h2>
                      <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed max-w-[380px]">
                        Generate exact code fixes for your findings. Review each diff and apply with confidence.
                      </p>
                    </div>
                  </div>

                  {/* 3-column feature highlights */}
                  <div className="w-full grid grid-cols-3 gap-3">
                    {([
                      { icon: Sparkles, title: 'AI-generated fixes',   text: 'Each finding gets an exact code fix with a diff to review',              iconStyle: { color: 'var(--color-ai-text)' }, bgStyle: { backgroundColor: 'var(--color-ai-bg)' } },
                      { icon: Eye,      title: 'You stay in control',   text: 'Accept or reject every fix individually before anything changes',        iconStyle: { color: 'var(--color-accent-default)' }, bgStyle: { backgroundColor: 'var(--color-accent-subtle)' } },
                      { icon: Shield,   title: 'Sandboxed execution',   text: 'Fixes run in an isolated environment before being proposed to you',      iconStyle: { color: 'var(--color-success-text)' }, bgStyle: { backgroundColor: 'var(--color-success-bg)' } },
                    ] as const).map(({ icon: Icon, title, text, iconStyle, bgStyle }) => (
                      <div key={title} className="flex flex-col gap-3 p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-surface)]">
                        <div className="w-8 h-8 rounded-[var(--radius-sharp)] flex items-center justify-center flex-shrink-0" style={bgStyle}>
                          <Icon size={14} style={iconStyle} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{title}</p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col items-center gap-2 -mt-2">
                    {repoEntry?.scanner.status && repoEntry.scanner.status !== 'not_scanned' && repoEntry.scanner.status !== 'scanning' ? (
                      <Button icon={Wand2} loading={checkingAutofix} onClick={() => runAutofixWithChecks(slug)}>
                        {checkingAutofix ? 'Checking...' : 'Run autofix'}
                      </Button>
                    ) : (
                      <>
                        <Button variant="secondary" icon={RefreshCw} onClick={() => setTopTab('analysis')}>Run scan first</Button>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Run a scan first to detect findings</p>
                      </>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Running state */}
            {afPageState === 'running' && (
              <div className="flex flex-col items-center pt-8 gap-6">
                <div className="w-full max-w-[640px] flex flex-col gap-6 items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-[var(--radius-card)] bg-[var(--color-accent-subtle)] border border-[var(--color-border-muted)] flex items-center justify-center">
                      <Spinner size="md" variant="accent" />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Autofix in progress</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] text-center">Generating fixes for {slug}.</p>
                  </div>
                  <div className="w-full"><ProgressBar value={(afRunStep / (AUTOFIX_STEPS.length - 1)) * 100} /></div>
                  <div className="w-full rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-5 flex flex-col gap-3">
                    {AUTOFIX_STEPS.map((step, i) => {
                      const isDone = i < afRunStep; const isActive = i === afRunStep
                      return (
                        <div key={i} className="flex items-center gap-3">
                          {isDone ? <CheckCircle size={16} className="text-[var(--color-success-text)] flex-shrink-0" /> : isActive ? <Spinner size="sm" className="flex-shrink-0" /> : <Circle size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />}
                          <span className={['text-sm', isDone ? 'text-[var(--color-success-text)]' : isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'].join(' ')}>{step}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Results state */}
            {afPageState === 'results' && (
              <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                  {/* Score strip */}
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-5">
                    <div className="flex items-center gap-5">
                      <CircularScore value={afSummary.total > 0 ? Math.round((afSummary.applied / afSummary.total) * 100) : 0} />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{data.repo.name}</h2>
                          <Badge variant={afSummary.total > 0 && afSummary.applied === afSummary.total ? 'success' : afSummary.applied > 0 ? 'warning' : 'danger'} size="sm">
                            {afSummary.total > 0 && afSummary.applied === afSummary.total ? 'Pass' : afSummary.applied > 0 ? 'Warning' : 'Fail'}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {data.repo.framework} · {data.repo.language} · Last run {afSession?.created_at} · {afSession?.scan_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" icon={RotateCcw} loading={checkingAutofix} onClick={handleRerun}>
                        {checkingAutofix ? 'Checking...' : 'Re-run'}
                      </Button>
                      <Button variant="secondary" icon={Download} onClick={handleExportPatch}>Export</Button>
                        </div>
                  </div>

                  {/* Sub tabs */}
                  <div className="flex items-center justify-between">
                    <Tabs
                      tabs={[
                        { label: 'Findings', value: 'findings', badge: afFindings.length },
                        { label: 'Activity', value: 'activity', badge: data.activity.length },
                      ]}
                      value={afSubTab}
                      onChange={(v) => setAfSubTab(v as 'findings' | 'activity')}
                      variant="pill"
                    />
                    {afSubTab === 'findings' && (
                      <div className="flex items-center gap-2">
                        <div className="w-[200px]">
                          <InputField label="" iconLeft={Search} value={afFindingsSearch} onChange={(e) => setAfFindingsSearch(e.target.value)} placeholder="Search findings..." />
                        </div>
                        <Dropdown
                          type="multi"
                          placeholder="Filter"
                          align="right"
                          triggerLabel={afFilters.length === 0 ? 'Filter' : `Filter (${afFilters.length})`}
                          triggerIcon={<Filter size={14} className="text-[var(--color-text-tertiary)]" />}
                          hideChevron
                          options={[
                            { label: 'Static Analysis', value: 'cat:static', group: 'Category' },
                            { label: 'Runtime', value: 'cat:runtime', group: 'Category' },
                            { label: 'Ready', value: 'ready', group: 'Fix Status' },
                            { label: 'Applied', value: 'applied', group: 'Fix Status' },
                            { label: 'Rejected', value: 'rejected', group: 'Fix Status' },
                          ]}
                          value={afFilters}
                          onChange={(v) => setAfFilters(v as string[])}
                        />
                      </div>
                    )}
                  </div>

                  {/* Findings sub-tab */}
                  {afSubTab === 'findings' && (<>
                  {afSelectedFindings.size > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border-focus)] bg-[var(--color-bg-surface)]">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{afSelectedFindings.size} selected</span>
                      <div className="w-px h-4 bg-[var(--color-border-muted)]" />
                      <Button variant="primary" size="sm" icon={Check} onClick={afBulkAccept}>Accept all</Button>
                      <Button variant="secondary" size="sm" icon={X} onClick={afBulkReject}>Reject all</Button>
                      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { toast(`Re-scanning ${afSelectedFindings.size} findings`); setAfSelectedFindings(new Set()) }}>Re-scan</Button>
                      <Button variant="text" size="sm" onClick={() => setAfSelectedFindings(new Set())}>Deselect all</Button>
                    </div>
                  )}

                  {/* Findings list */}
                  {afFilteredFindings.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
                      <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center"><Wand2 size={24} className="text-[var(--color-text-tertiary)]" /></div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">No matching findings</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Try a different filter</p>
                    </div>
                  ) : (
                    <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)]">
                      <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-raised)] border-b border-[var(--color-border-muted)] rounded-t-[var(--radius-base)]">
                        <Checkbox checked={afAllSelected} indeterminate={afSomeSelected && !afAllSelected} onChange={afToggleSelectAll} />
                        <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">{afAllSelected ? 'Deselect all' : 'Select all'}</span>
                      </div>
                      {afPaginatedFindings.map(finding => {
                        const isExpanded = afExpandedFinding === finding.finding_id
                        const isDimmed = finding.fix_status === 'applied' || finding.fix_status === 'rejected'
                        const isSelected = afSelectedFindings.has(finding.finding_id)
                        const badge = fixStatusBadge[finding.fix_status]
                        const sev = afSeverityStyles[finding.severity] || afSeverityStyles.warning
                        return (
                          <div key={finding.finding_id} className={['border-b border-[var(--color-border-muted)] last:border-b-0 last:rounded-b-[var(--radius-base)]', isDimmed ? 'opacity-50' : ''].filter(Boolean).join(' ')}>
                            <div className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-[var(--color-bg-surface)] transition-colors">
                              <div onClick={(e) => e.stopPropagation()}><Checkbox checked={isSelected} onChange={() => afToggleSelect(finding.finding_id)} /></div>
                              <button onClick={() => setAfExpandedFinding(isExpanded ? null : finding.finding_id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                <span className="text-[11px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: sev.color }}>{sev.label}</span>
                                <div className="w-px h-4 bg-[var(--color-border-muted)] flex-shrink-0" />
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{finding.title}</span>
                                  {finding.fix_status === 'applied' && <Badge variant="success" size="sm">Applied</Badge>}
                                  {finding.fix_status === 'rejected' && <Badge variant="danger" size="sm">Rejected</Badge>}
                                </div>
                                <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono hidden sm:block">{finding.file_path}:{finding.start_line}</code>
                                <ChevronDown size={14} className={['text-[var(--color-text-tertiary)] transition-transform', isExpanded ? 'rotate-180' : ''].join(' ')} />
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="px-4 pb-4 flex flex-col gap-4 bg-[var(--color-bg-surface)]">
                                {finding.fix_status === 'pending' && (
                                  <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                                    <Circle size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" /><span className="text-sm text-[var(--color-text-tertiary)]">Waiting to be processed</span>
                                  </div>
                                )}
                                {finding.fix_status === 'running' && (
                                  <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] p-3 flex flex-col gap-2">
                                    {FINDING_FIX_STEPS.map((step, i) => {
                                      const progress = afFindingProgress[finding.finding_id] ?? 0; const isDone = i < progress; const isActive = i === progress
                                      return (
                                        <div key={i} className="flex items-center gap-2.5">
                                          {isDone ? <CheckCircle size={14} className="text-[var(--color-success-text)] flex-shrink-0" /> : isActive ? <Spinner size="sm" className="flex-shrink-0" /> : <Circle size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />}
                                          <span className={['text-sm', isDone ? 'text-[var(--color-success-text)]' : isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'].join(' ')}>{step}{isActive && i === 1 ? ` — ${finding.tool_name}` : ''}</span>
                                        </div>
                                      )
                                    })}
                                    <div className="pt-2"><Button variant="secondary" size="sm" disabled>Fixing...</Button></div>
                                  </div>
                                )}
                                {finding.fix_status === 'ready' && (
                                  <>
                                    {finding.ai_fix && <div className="flex flex-col gap-1.5 pt-2"><p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">AI Fix Description</p><p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{finding.ai_fix}</p></div>}
                                    {finding.code_snippet && finding.replacement && (
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2"><p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p><code className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{finding.file_path} · line {finding.start_line}</code></div>
                                        <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden font-mono text-xs">
                                          <div className="bg-[var(--color-danger-bg)] px-3 py-2.5 border-b border-[var(--color-border-muted)]"><span className="font-sans text-[10px] font-semibold text-[var(--color-danger-text)] uppercase tracking-wide">Remove</span><pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.code_snippet}</pre></div>
                                          <div className="bg-[var(--color-success-bg)] px-3 py-2.5"><span className="font-sans text-[10px] font-semibold text-[var(--color-success-text)] uppercase tracking-wide">Add</span><pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.replacement}</pre></div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border-muted)]">
                                      <Button variant="primary" size="sm" icon={Check} onClick={() => acceptFix(finding.finding_id)}>Accept fix</Button>
                                      <Button variant="secondary" size="sm" icon={X} onClick={() => rejectFix(finding.finding_id)}>Reject</Button>
                                    </div>
                                  </>
                                )}
                                {finding.fix_status === 'applied' && finding.code_snippet && finding.replacement && (
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2"><p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p><code className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{finding.file_path} · line {finding.start_line}</code></div>
                                    <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden font-mono text-xs">
                                      <div className="bg-[var(--color-danger-bg)] px-3 py-2.5 border-b border-[var(--color-border-muted)]"><span className="font-sans text-[10px] font-semibold text-[var(--color-danger-text)] uppercase tracking-wide">Remove</span><pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.code_snippet}</pre></div>
                                      <div className="bg-[var(--color-success-bg)] px-3 py-2.5"><span className="font-sans text-[10px] font-semibold text-[var(--color-success-text)] uppercase tracking-wide">Add</span><pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.replacement}</pre></div>
                                    </div>
                                  </div>
                                )}
                                {finding.fix_status === 'rejected' && (
                                  <>
                                    <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                                      <Info size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                                      <span className="text-sm text-[var(--color-text-secondary)]">Fix rejected by {finding.rejected_by} · {finding.rejected_at}</span>
                                    </div>
                                    {finding.code_snippet && finding.replacement && (
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2"><p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p><code className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{finding.file_path} · line {finding.start_line}</code></div>
                                        <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden font-mono text-xs">
                                          <div className="bg-[var(--color-danger-bg)] px-3 py-2.5 border-b border-[var(--color-border-muted)]"><span className="font-sans text-[10px] font-semibold text-[var(--color-danger-text)] uppercase tracking-wide">Remove</span><pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.code_snippet}</pre></div>
                                          <div className="bg-[var(--color-success-bg)] px-3 py-2.5"><span className="font-sans text-[10px] font-semibold text-[var(--color-success-text)] uppercase tracking-wide">Add</span><pre className="mt-1.5 whitespace-pre-wrap text-[var(--color-text-secondary)] leading-relaxed">{finding.replacement}</pre></div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="pt-3 border-t border-[var(--color-border-muted)]"><Button variant="secondary" size="sm" icon={RotateCcw} onClick={() => reconsiderFix(finding.finding_id)}>Reconsider</Button></div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {afFilteredFindings.length > afPageSize && (
                    <Pagination currentPage={afFindingsPage} totalPages={afTotalPages} totalItems={afFilteredFindings.length} pageSize={afPageSize} pageSizeOptions={PAGE_SIZE_OPTIONS} onPageChange={setAfFindingsPage} onPageSizeChange={(size) => { setAfPageSize(size); setAfFindingsPage(1) }} />
                  )}
                  </>)}

                  {/* Activity sub-tab */}
                  {afSubTab === 'activity' && (
                    <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden px-5 py-4">
                      {data.activity.map((item, i) => {
                        const iconMap = { scan: Shield, fix: CheckCircle, ignore: EyeOff, add: Circle }
                        const Icon = iconMap[item.type]
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center flex-shrink-0"><Icon size={12} className="text-[var(--color-text-tertiary)]" /></div>
                              {i < data.activity.length - 1 && <div className="w-px flex-1 bg-[var(--color-border-muted)] my-1" />}
                            </div>
                            <div className={i < data.activity.length - 1 ? 'pb-4' : ''}>
                              <p className="text-sm text-[var(--color-text-primary)]">{item.action}</p>
                              <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.timestamp} · {item.user}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Autofix sidebar */}
                <div className="w-[280px] flex-shrink-0 sticky top-0 flex flex-col gap-4">
                  <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Scan Info</p>
                    <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex justify-between"><span>Runner</span><span className="text-[var(--color-text-primary)] font-medium">Docker</span></div>
                      <div className="flex justify-between"><span>Scan ID</span><code className="text-[var(--color-text-primary)] font-mono text-[11px]">{afSession?.scan_id}</code></div>
                      <div className="flex justify-between"><span>Run time</span><span className="text-[var(--color-text-primary)]">{afSession?.created_at}</span></div>
                      <div className="flex justify-between"><span>Run by</span><span className="text-[var(--color-text-primary)]">{afSession?.created_by}</span></div>
                    </div>
                  </div>
                  {afFindings.length > 0 && (
                    <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                      <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Readiness</p>
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--color-text-secondary)]">Fix readiness</span>
                            <span className="text-xs font-medium" style={{ color: readinessColor(afSummary.total > 0 ? Math.round((afSummary.applied / afSummary.total) * 100) : 0) }}>
                              {afSummary.total > 0 ? Math.round((afSummary.applied / afSummary.total) * 100) : 0}%
                            </span>
                          </div>
                          <ProgressBar value={afSummary.total > 0 ? Math.round((afSummary.applied / afSummary.total) * 100) : 0} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--color-text-secondary)]">After all accepted</span>
                            <span className="text-xs font-medium" style={{ color: readinessColor(100) }}>100%</span>
                          </div>
                          <ProgressBar value={100} />
                        </div>
                      </div>
                    </div>
                  )}
                  {attestation && (
                    <>
                      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2"><Shield size={14} className="text-[var(--color-accent-default)]" /><p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Behavioral Attestation</p></div>
                        <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                          <div className="flex justify-between"><span>Schema</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.schema}</span></div>
                          <div className="flex justify-between"><span>Generated</span><span className="text-[var(--color-text-primary)] text-[11px]">{new Date(attestation.generated_at).toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span></div>
                          <div className="flex justify-between"><span>Source</span><span className="text-[var(--color-text-primary)] font-mono text-[11px] truncate max-w-[140px]">{attestation.source}</span></div>
                          <div className="flex justify-between"><span>Score</span><span className={`font-semibold text-[11px] ${attestation.score >= 80 ? 'text-[var(--color-success-text)]' : attestation.score >= 50 ? 'text-[var(--color-warning-text)]' : 'text-[var(--color-danger-text)]'}`}>{attestation.score} / 100</span></div>
                          <div className="flex justify-between"><span>Network calls</span><span className="text-[var(--color-text-primary)] text-[11px]">{attestation.network_calls.length > 0 && attestation.network_calls[0] !== 'none detected' ? `${attestation.network_calls.length} detected` : 'none detected'}</span></div>
                          <div className="flex justify-between"><span>File writes</span><span className="text-[var(--color-text-primary)] text-[11px]">{attestation.file_writes[0]}</span></div>
                          <div className="flex justify-between"><span>Source hash</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.source_hash.slice(0, 12)}…</span></div>
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                        <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Sigstore Signing</p>
                        <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                          <div className="flex justify-between"><span>Mode</span><span className="text-[var(--color-text-primary)] text-[11px]">keyless signed</span></div>
                          <div className="flex justify-between"><span>Issuer</span><span className="text-[var(--color-text-primary)] font-mono text-[11px] truncate max-w-[140px]">{attestation.signing.issuer.replace('https://', '').slice(0, 20)}…</span></div>
                          <div className="flex justify-between"><span>Identity</span><span className="text-[var(--color-text-primary)] font-mono text-[11px] truncate max-w-[140px]">{attestation.signing.identity.slice(0, 18)}…</span></div>
                          <div className="flex justify-between"><span>Rekor log</span><span className="text-[var(--color-success-text)] text-[11px]">✓ included</span></div>
                          <div className="flex justify-between"><span>Fulcio cert</span><span className="text-[var(--color-success-text)] text-[11px]">✓ valid</span></div>
                          <div className="flex justify-between"><span>SHA256</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.signing.sha256.slice(0, 12)}…</span></div>
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                        <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Generated Policy</p>
                        <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                          <div className="flex justify-between"><span>File</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.policy.filename}</span></div>
                          <div className="flex justify-between"><span>Mode</span><span className="text-[var(--color-text-primary)] text-[11px]">least-privilege</span></div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="secondary" size="sm" icon={FileText} onClick={() => setShowPolicyModal(true)}>View policy</Button>
                          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadPolicy}>Download</Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Policy modal */}
      {attestation && (
        <Modal open={showPolicyModal} onClose={() => setShowPolicyModal(false)} title={attestation.policy.filename} footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopyPolicy}>Copy</Button>
            <Button variant="primary" size="sm" icon={Download} onClick={() => { handleDownloadPolicy(); setShowPolicyModal(false) }}>Download</Button>
          </div>
        }>
          <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
            <pre className="text-xs font-mono text-[var(--color-text-secondary)] leading-relaxed whitespace-pre">{attestation.policy.content}</pre>
          </div>
        </Modal>
      )}

      {gateModal && <FeatureGateModal open={!!gateModal} feature={gateModal} onClose={() => setGateModal(null)} />}
      {autofixPreflightModals}
      {enrichPreflightModals}
    </main>
    </div>
  )
}
