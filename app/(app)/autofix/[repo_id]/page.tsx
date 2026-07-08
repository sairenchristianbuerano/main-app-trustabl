'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import {
  Wand2, Play, Download, RotateCcw, ChevronDown,
  CheckCircle, XCircle, Circle, Loader2,
  Info, Check, X, GitBranch, Lock, Shield, FileText, Copy,
} from 'lucide-react'
import { Button, Badge, Tabs, Checkbox, Modal, Spinner } from '@/components/ui'
import { EmptyState } from '@/components/patterns/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useToast } from '@/components/ui/ToastContext'
import { useAutofixPreflight } from '@/hooks/useAutofixPreflight'
import {
  getAutofixSession, getAutofixRepos, generateAttestation,
  type AutofixFinding, type AutofixSession, type FixStatus, type AttestationData,
} from '../mock-data'

const severityStyles: Record<string, { color: string; label: string }> = {
  critical: { color: 'var(--color-danger-text)', label: 'CRIT' },
  warning: { color: 'var(--color-warning-text)', label: 'WARN' },
  info: { color: 'var(--color-info-text)', label: 'INFO' },
}

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

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Ready', value: 'ready' },
  { label: 'Running', value: 'running' },
  { label: 'Applied', value: 'applied' },
  { label: 'Rejected', value: 'rejected' },
]

type PageState = 'empty' | 'running' | 'results'

export default function AutofixDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const repoId = decodeURIComponent(params.repo_id as string)

  const [pageState, setPageState] = useState<PageState>('empty')
  const [session, setSession] = useState<AutofixSession | null>(null)
  const [findings, setFindings] = useState<AutofixFinding[]>([])
  const [filter, setFilter] = useState('all')
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)
  const [selectedFindings, setSelectedFindings] = useState<Set<string>>(new Set())

  const [attestation, setAttestation] = useState<AttestationData | null>(null)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  const [runStep, setRunStep] = useState(0)
  const [findingProgress, setFindingProgress] = useState<Record<string, number>>({})
  const runTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const existingSession = getAutofixSession(repoId)
    if (existingSession) {
      setSession(existingSession)
      setFindings(existingSession.findings)
      setAttestation(generateAttestation(repoId, existingSession.id))
      setPageState('results')
    } else {
      const repos = getAutofixRepos()
      const repo = repos.find(r => r.repo_name === repoId)
      if (repo && repo.autofix_status === 'running') {
        setPageState('running')
      } else {
        setPageState('empty')
      }
    }
  }, [repoId])

  useEffect(() => {
    return () => {
      if (runTimer.current) clearInterval(runTimer.current)
    }
  }, [])

  const beginAutofixSimulation = useCallback(() => {
    setPageState('running')
    setRunStep(0)
    setFindingProgress({})

    let step = 0
    runTimer.current = setInterval(() => {
      step++
      if (step < AUTOFIX_STEPS.length) {
        setRunStep(step)
      } else {
        if (runTimer.current) clearInterval(runTimer.current)

        const existingSession = getAutofixSession(repoId)
        if (existingSession) {
          const newFindings = existingSession.findings.map(f => ({
            ...f,
            fix_status: 'ready' as FixStatus,
            applied_at: undefined,
            applied_by: undefined,
            rejected_at: undefined,
            rejected_by: undefined,
          }))
          setSession({ ...existingSession, status: 'completed', created_at: 'Just now', created_by: 'Zane F.' })
          setFindings(newFindings)
        } else {
          const mockFindings: AutofixFinding[] = Array.from({ length: 6 }, (_, i) => ({
            finding_id: `af-${repoId}-gen-${i}`,
            rule_id: `CAGENT-0${50 + i}`,
            severity: ['critical', 'high', 'medium', 'low'][i % 4],
            title: ['No error handling on LLM calls', 'Missing input validation', 'No retry mechanism', 'Hardcoded configuration', 'Missing structured logging', 'No rate limiting'][i],
            scope: ['agent', 'skill', 'tool'][i % 3],
            tool_name: ['agent-lint', 'prompt-guard', 'semgrep'][i % 3],
            file_path: `src/${['agent', 'skill', 'tool'][i % 3]}s/main.ts`,
            start_line: 10 + i * 15,
            end_line: 18 + i * 15,
            fix_status: 'ready' as FixStatus,
            code_snippet: `// Current implementation\nfunction handle() {\n  return process(input)\n}`,
            replacement: `// Fixed implementation\nfunction handle() {\n  const validated = validate(input)\n  try {\n    return process(validated)\n  } catch (err) {\n    logger.error(err)\n    return fallback(err)\n  }\n}`,
            ai_fix: 'Apply input validation and error handling with proper fallback behavior.',
          }))
          setSession({
            id: `ses_${repoId.slice(0, 6)}_new`,
            repo_id: repoId,
            repo_name: repoId,
            scan_id: `scn_${repoId.slice(0, 8)}`,
            status: 'completed',
            created_at: 'Just now',
            created_by: 'Zane F.',
            findings: mockFindings,
          })
          setFindings(mockFindings)
        }

        setPageState('results')
        setAttestation(generateAttestation(repoId, `ses_${repoId.slice(0, 6)}_new`))
        toast('Autofix complete')
      }
    }, 1500)
  }, [repoId, toast])

  const { run: runAutofixWithChecks, checking: checkingAutofix, modals: autofixPreflightModals } = useAutofixPreflight(beginAutofixSimulation)

  const acceptFix = useCallback((findingId: string) => {
    setFindings(prev => prev.map(f =>
      f.finding_id === findingId
        ? { ...f, fix_status: 'applied' as FixStatus, applied_at: 'Just now', applied_by: 'Zane F.' }
        : f
    ))
  }, [])

  const rejectFix = useCallback((findingId: string) => {
    setFindings(prev => prev.map(f =>
      f.finding_id === findingId
        ? { ...f, fix_status: 'rejected' as FixStatus, rejected_at: 'Just now', rejected_by: 'Zane F.' }
        : f
    ))
  }, [])

  const reconsiderFix = useCallback((findingId: string) => {
    setFindings(prev => prev.map(f =>
      f.finding_id === findingId
        ? { ...f, fix_status: 'ready' as FixStatus, rejected_at: undefined, rejected_by: undefined }
        : f
    ))
  }, [])

  const bulkAccept = useCallback(() => {
    setFindings(prev => prev.map(f =>
      selectedFindings.has(f.finding_id) && f.fix_status === 'ready'
        ? { ...f, fix_status: 'applied' as FixStatus, applied_at: 'Just now', applied_by: 'Zane F.' }
        : f
    ))
    toast(`${selectedFindings.size} fixes accepted`)
    setSelectedFindings(new Set())
  }, [selectedFindings, toast])

  const bulkReject = useCallback(() => {
    setFindings(prev => prev.map(f =>
      selectedFindings.has(f.finding_id) && f.fix_status === 'ready'
        ? { ...f, fix_status: 'rejected' as FixStatus, rejected_at: 'Just now', rejected_by: 'Zane F.' }
        : f
    ))
    toast(`${selectedFindings.size} fixes rejected`)
    setSelectedFindings(new Set())
  }, [selectedFindings, toast])

  const handleExportPatch = useCallback(() => {
    toast('Patch file downloaded')
  }, [toast])

  const handleDownloadPolicy = useCallback(() => {
    if (!attestation) return
    const blob = new Blob([attestation.policy.content], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attestation.policy.filename
    a.click()
    URL.revokeObjectURL(url)
    toast('Policy downloaded')
  }, [attestation, toast])

  const handleCopyPolicy = useCallback(() => {
    if (!attestation) return
    navigator.clipboard.writeText(attestation.policy.content)
    toast('Copied to clipboard')
  }, [attestation, toast])

  const handleRerun = useCallback(() => {
    setFindings([])
    setSession(null)
    setSelectedFindings(new Set())
    setExpandedFinding(null)
    setFilter('all')
    runAutofixWithChecks(repoId)
  }, [runAutofixWithChecks, repoId])

  const filteredFindings = useMemo(() => {
    if (filter === 'all') return findings
    return findings.filter(f => f.fix_status === filter)
  }, [findings, filter])

  const toggleFindingSelect = (id: string) => {
    setSelectedFindings(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = filteredFindings.length > 0 && filteredFindings.every(f => selectedFindings.has(f.finding_id))
  const someSelected = filteredFindings.some(f => selectedFindings.has(f.finding_id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedFindings(prev => {
        const next = new Set(prev)
        filteredFindings.forEach(f => next.delete(f.finding_id))
        return next
      })
    } else {
      setSelectedFindings(prev => {
        const next = new Set(prev)
        filteredFindings.forEach(f => next.add(f.finding_id))
        return next
      })
    }
  }

  const summary = useMemo(() => {
    const total = findings.length
    const ready = findings.filter(f => f.fix_status === 'ready').length
    const running = findings.filter(f => f.fix_status === 'running').length
    const applied = findings.filter(f => f.fix_status === 'applied').length
    const rejected = findings.filter(f => f.fix_status === 'rejected').length
    return { total, ready, running, applied, rejected }
  }, [findings])

  const scopeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    findings.forEach(f => { counts[f.scope] = (counts[f.scope] || 0) + 1 })
    return counts
  }, [findings])

  // --- EMPTY STATE ---
  if (pageState === 'empty') {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
        <div className="w-full max-w-[720px] flex flex-col gap-6">
          <EmptyState
            icon={Wand2}
            title="No autofix results yet"
            description="Run autofix to automatically generate code fixes for this repository. Review each fix before applying."
            action={{ label: checkingAutofix ? 'Checking...' : 'Run autofix', onClick: () => runAutofixWithChecks(repoId) }}
          />

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[var(--color-info-text)]" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">What autofix does</p>
            </div>
            <ul className="flex flex-col gap-2 pl-6 text-sm text-[var(--color-text-secondary)]">
              <li className="list-disc">Runs findings through sandbox environment</li>
              <li className="list-disc">Generates exact code fixes per finding</li>
              <li className="list-disc">Shows diff for your review</li>
              <li className="list-disc">You accept or reject each fix</li>
            </ul>
          </div>
        </div>

        {autofixPreflightModals}
      </main>
    )
  }

  // --- RUNNING STATE ---
  if (pageState === 'running') {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
        <div className="w-full max-w-[640px] flex flex-col gap-6 items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-[var(--radius-card)] bg-[var(--color-accent-subtle)] border border-[var(--color-border-muted)] flex items-center justify-center">
              <Spinner size="md" variant="accent" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Autofix in progress</h2>
            <p className="text-sm text-[var(--color-text-secondary)] text-center">
              Generating fixes for {repoId}. You will be notified when complete.
            </p>
          </div>

          <div className="w-full">
            <ProgressBar value={(runStep / (AUTOFIX_STEPS.length - 1)) * 100} />
          </div>

          <div className="w-full rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-5 flex flex-col gap-3">
            {AUTOFIX_STEPS.map((step, i) => {
              const isDone = i < runStep
              const isActive = i === runStep
              return (
                <div key={i} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle size={16} className="text-[var(--color-success-text)] flex-shrink-0" />
                  ) : isActive ? (
                    <Spinner size="sm" className="flex-shrink-0" />
                  ) : (
                    <Circle size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                  )}
                  <span className={[
                    'text-sm',
                    isDone ? 'text-[var(--color-success-text)]' : isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]',
                  ].join(' ')}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  // --- RESULTS STATE ---
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="w-full max-w-[1120px] flex flex-col gap-4">
        <div className="flex gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Autofix Results</h2>
                  {attestation && (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="neutral" size="sm">
                        <span className="flex items-center gap-1">
                          <GitBranch size={11} />
                          branch: main
                        </span>
                      </Badge>
                      {attestation.signing.signed ? (
                        <Badge variant="success" size="sm">
                          <span className="flex items-center gap-1">
                            <Lock size={11} />
                            Sigstore ✓ signed
                          </span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Unsigned</Badge>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {repoId} · {session?.scan_id} · {session?.created_at}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={RotateCcw} loading={checkingAutofix} onClick={handleRerun}>
                  {checkingAutofix ? 'Checking...' : 'Re-run'}
                </Button>
                <Button variant="secondary" size="sm" icon={Download} onClick={handleExportPatch}>Export patch</Button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total fixable', value: summary.total, color: 'var(--color-text-primary)' },
                { label: 'Fix ready', value: summary.ready, color: 'var(--color-success-text)' },
                { label: 'Applied', value: summary.applied, color: 'var(--color-info-text)' },
                { label: 'Rejected', value: summary.rejected, color: 'var(--color-text-tertiary)' },
              ].map(card => (
                <div key={card.label} className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">{card.label}</span>
                  <span className="text-2xl font-semibold" style={{ color: card.color }}>{card.value}</span>
                </div>
              ))}
            </div>

            {/* Findings toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Findings</span>
                <Badge variant="neutral" size="sm">{findings.length}</Badge>
              </div>
              <Tabs
                tabs={filterTabs.map(t => ({
                  ...t,
                  badge: t.value === 'all' ? findings.length : findings.filter(f => f.fix_status === t.value).length,
                }))}
                value={filter}
                onChange={setFilter}
                variant="pill"
              />
            </div>

            {/* Bulk actions bar */}
            {selectedFindings.size > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border-focus)] bg-[var(--color-bg-surface)]">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{selectedFindings.size} selected</span>
                <div className="w-px h-4 bg-[var(--color-border-muted)]" />
                <Button variant="primary" size="sm" icon={Check} onClick={bulkAccept}>Accept all</Button>
                <Button variant="secondary" size="sm" icon={X} onClick={bulkReject}>Reject all</Button>
                <Button variant="text" size="sm" onClick={() => setSelectedFindings(new Set())}>Deselect all</Button>
              </div>
            )}

            {/* Findings list */}
            {filteredFindings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
                <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
                  <Wand2 size={24} className="text-[var(--color-text-tertiary)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">No matching findings</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Try a different filter</p>
              </div>
            ) : (
              <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)]">
                {/* Select-all header */}
                <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-raised)] border-b border-[var(--color-border-muted)] rounded-t-[var(--radius-base)]">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </span>
                </div>

                {filteredFindings.map(finding => {
                  const isExpanded = expandedFinding === finding.finding_id
                  const isDimmed = finding.fix_status === 'applied' || finding.fix_status === 'rejected'
                  const isSelected = selectedFindings.has(finding.finding_id)
                  const badge = fixStatusBadge[finding.fix_status]
                  const sev = severityStyles[finding.severity] || severityStyles.warning

                  return (
                    <div key={finding.finding_id} className={['border-b border-[var(--color-border-muted)] last:border-b-0 last:rounded-b-[var(--radius-base)]', isDimmed ? 'opacity-50' : ''].filter(Boolean).join(' ')}>
                      {/* Row */}
                      <div className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-[var(--color-bg-surface)] transition-colors">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSelected} onChange={() => toggleFindingSelect(finding.finding_id)} />
                        </div>
                        <button
                          onClick={() => setExpandedFinding(isExpanded ? null : finding.finding_id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: sev.color }}>{sev.label}</span>
                          <div className="w-px h-4 bg-[var(--color-border-muted)] flex-shrink-0" />
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{finding.title}</span>
                            <Badge variant="neutral" size="sm">{finding.scope}</Badge>
                          </div>
                          <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono hidden sm:block">{finding.file_path}:{finding.start_line}</code>
                          {badge && (
                            <Badge variant={badge.variant} size="sm">
                              <span className="flex items-center gap-1.5">
                                {finding.fix_status === 'running' && <Loader2 size={10} className="animate-spin" />}
                                {badge.label}
                              </span>
                            </Badge>
                          )}
                          <ChevronDown size={14} className={['text-[var(--color-text-tertiary)] transition-transform', isExpanded ? 'rotate-180' : ''].join(' ')} />
                        </button>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 flex flex-col gap-4 bg-[var(--color-bg-surface)]">

                          {/* Pending state */}
                          {finding.fix_status === 'pending' && (
                            <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                              <Circle size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                              <span className="text-sm text-[var(--color-text-tertiary)]">Waiting to be processed</span>
                            </div>
                          )}

                          {/* Running state */}
                          {finding.fix_status === 'running' && (
                            <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] p-3 flex flex-col gap-2">
                              {FINDING_FIX_STEPS.map((step, i) => {
                                const progress = findingProgress[finding.finding_id] ?? 0
                                const isDone = i < progress
                                const isActive = i === progress
                                return (
                                  <div key={i} className="flex items-center gap-2.5">
                                    {isDone ? (
                                      <CheckCircle size={14} className="text-[var(--color-success-text)] flex-shrink-0" />
                                    ) : isActive ? (
                                      <Spinner size="sm" className="flex-shrink-0" />
                                    ) : (
                                      <Circle size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                                    )}
                                    <span className={[
                                      'text-sm',
                                      isDone ? 'text-[var(--color-success-text)]' : isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]',
                                    ].join(' ')}>
                                      {step}
                                      {isActive && i === 1 ? ` — ${finding.tool_name}` : ''}
                                    </span>
                                  </div>
                                )
                              })}
                              <div className="pt-2">
                                <Button variant="secondary" size="sm" disabled>Fixing...</Button>
                              </div>
                            </div>
                          )}

                          {/* Ready state */}
                          {finding.fix_status === 'ready' && (
                            <>
                              {finding.ai_fix && (
                                <div className="flex flex-col gap-1.5 pt-2">
                                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">AI Fix Description</p>
                                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{finding.ai_fix}</p>
                                </div>
                              )}

                              {finding.code_snippet && finding.replacement && (
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p>
                                    <code className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{finding.file_path} · line {finding.start_line}</code>
                                  </div>
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

                              <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border-muted)]">
                                <Button variant="primary" size="sm" icon={Check} onClick={() => acceptFix(finding.finding_id)}>Accept fix</Button>
                                <Button variant="secondary" size="sm" icon={X} onClick={() => rejectFix(finding.finding_id)}>Reject</Button>
                              </div>
                            </>
                          )}

                          {/* Applied state */}
                          {finding.fix_status === 'applied' && (
                            <>
                              <div className="rounded-[var(--radius-base)] bg-[var(--color-success-bg)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                                <CheckCircle size={14} className="text-[var(--color-success-text)] flex-shrink-0" />
                                <span className="text-sm text-[var(--color-success-text)]">
                                  Fix accepted · Applied by {finding.applied_by} · {finding.applied_at}
                                </span>
                              </div>

                              {finding.code_snippet && finding.replacement && (
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p>
                                    <code className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{finding.file_path} · line {finding.start_line}</code>
                                  </div>
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

                              <div className="pt-3 border-t border-[var(--color-border-muted)]">
                                <Button variant="secondary" size="sm" disabled>Already applied</Button>
                              </div>
                            </>
                          )}

                          {/* Rejected state */}
                          {finding.fix_status === 'rejected' && (
                            <>
                              <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                                <Info size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                  Fix rejected by {finding.rejected_by} · {finding.rejected_at}
                                </span>
                              </div>

                              {finding.code_snippet && finding.replacement && (
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Code Diff</p>
                                    <code className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{finding.file_path} · line {finding.start_line}</code>
                                  </div>
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

                              <div className="pt-3 border-t border-[var(--color-border-muted)]">
                                <Button variant="secondary" size="sm" icon={RotateCcw} onClick={() => reconsiderFix(finding.finding_id)}>Reconsider</Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-[280px] flex-shrink-0 sticky top-0 flex flex-col gap-4">

            {/* Session info */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Session Info</p>
              <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                <div className="flex justify-between"><span>Repo</span><span className="text-[var(--color-text-primary)] font-medium">{repoId}</span></div>
                <div className="flex justify-between"><span>Scan ID</span><code className="text-[var(--color-text-primary)] font-mono text-[11px]">{session?.scan_id}</code></div>
                <div className="flex justify-between"><span>Run time</span><span className="text-[var(--color-text-primary)]">{session?.created_at}</span></div>
                <div className="flex justify-between"><span>Run by</span><span className="text-[var(--color-text-primary)]">{session?.created_by}</span></div>
              </div>
            </div>

            {/* Fix status */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Fix Status</p>
              <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Fix ready</span>
                  <span className="text-[var(--color-success-text)] font-medium">{summary.ready}</span>
                </div>
                {summary.running > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      Running
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-info-text)] animate-pulse" />
                    </span>
                    <span className="text-[var(--color-info-text)] font-medium">{summary.running}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Applied</span>
                  <span className="text-[var(--color-text-primary)] font-medium">{summary.applied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rejected</span>
                  <span className="text-[var(--color-text-primary)] font-medium">{summary.rejected}</span>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Breakdown</p>
              <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Total fixable</span>
                  <span className="text-[var(--color-text-primary)] font-medium">{summary.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scope</span>
                  <span className="text-[var(--color-text-primary)]">
                    {Object.entries(scopeBreakdown).map(([k, v]) => `${k} ${v}`).join(' · ')}
                  </span>
                </div>
              </div>
            </div>

            {attestation && (
              <>
                {/* Behavioral Attestation */}
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-[var(--color-accent-default)]" />
                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Behavioral Attestation</p>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                    <div className="flex justify-between"><span>Schema</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.schema}</span></div>
                    <div className="flex justify-between"><span>Generated</span><span className="text-[var(--color-text-primary)] text-[11px]">{new Date(attestation.generated_at).toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span></div>
                    <div className="flex justify-between"><span>Source</span><span className="text-[var(--color-text-primary)] font-mono text-[11px] truncate max-w-[140px]">{attestation.source}</span></div>
                    <div className="flex justify-between">
                      <span>Score</span>
                      <span className={`font-semibold text-[11px] ${attestation.score >= 80 ? 'text-[var(--color-success-text)]' : attestation.score >= 50 ? 'text-[var(--color-warning-text)]' : 'text-[var(--color-danger-text)]'}`}>
                        {attestation.score} / 100
                      </span>
                    </div>
                    <div className="flex justify-between"><span>Network calls</span><span className="text-[var(--color-text-primary)] text-[11px]">{attestation.network_calls.length > 0 && attestation.network_calls[0] !== 'none detected' ? `${attestation.network_calls.length} detected` : 'none detected'}</span></div>
                    <div className="flex justify-between"><span>File writes</span><span className="text-[var(--color-text-primary)] text-[11px]">{attestation.file_writes[0]}</span></div>
                    <div className="flex justify-between"><span>Source hash</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.source_hash.slice(0, 12)}…</span></div>
                  </div>
                </div>

                {/* Sigstore Signing */}
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[var(--color-success-text)]" />
                      <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Sigstore Signing</p>
                    </div>
                    <Badge variant="success" size="sm">
                      <span className="flex items-center gap-1">
                        <Lock size={9} />
                        keyless signed
                      </span>
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                    <div className="flex justify-between"><span>Issuer</span><span className="text-[var(--color-text-primary)] font-mono text-[11px] truncate max-w-[140px]">{attestation.signing.issuer.replace('https://', '').slice(0, 20)}…</span></div>
                    <div className="flex justify-between"><span>Identity</span><span className="text-[var(--color-text-primary)] font-mono text-[11px] truncate max-w-[140px]">{attestation.signing.identity.slice(0, 18)}…</span></div>
                    <div className="flex justify-between"><span>Rekor log</span><span className="text-[var(--color-success-text)] text-[11px]">✓ included</span></div>
                    <div className="flex justify-between"><span>Fulcio cert</span><span className="text-[var(--color-success-text)] text-[11px]">✓ valid</span></div>
                    <div className="flex justify-between"><span>SHA256</span><span className="text-[var(--color-text-primary)] font-mono text-[11px]">{attestation.signing.sha256.slice(0, 12)}…</span></div>
                  </div>
                </div>

                {/* Generated Policy */}
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[var(--color-accent-default)]" />
                    <div className="flex flex-col">
                      <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Generated Policy</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{attestation.policy.filename} · least-privilege</p>
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] p-3 overflow-x-auto">
                    <pre className="text-[10px] font-mono text-[var(--color-text-secondary)] leading-relaxed whitespace-pre">{attestation.policy.content.split('\n').slice(0, 12).join('\n')}
…</pre>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" icon={FileText} onClick={() => setShowPolicyModal(true)}>View full policy</Button>
                    <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadPolicy}>Download YAML</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Policy modal */}
      {attestation && (
        <Modal
          open={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          title={attestation.policy.filename}
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopyPolicy}>Copy</Button>
              <Button variant="primary" size="sm" icon={Download} onClick={() => { handleDownloadPolicy(); setShowPolicyModal(false) }}>Download</Button>
            </div>
          }
        >
          <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
            <pre className="text-xs font-mono text-[var(--color-text-secondary)] leading-relaxed whitespace-pre">{attestation.policy.content}</pre>
          </div>
        </Modal>
      )}

      {autofixPreflightModals}
    </main>
  )
}
