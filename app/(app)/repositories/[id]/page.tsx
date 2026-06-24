'use client'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  ChevronDown, RefreshCw, Download,
  CheckCircle, EyeOff, Shield, Circle,
  Sparkles, Info,
} from 'lucide-react'
import { Button, Badge, Pagination, Dropdown, Tabs, Checkbox, Spinner, Tooltip } from '@/components/ui'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getRepoDetail, generateMockEnrichment, type Finding } from './mock-data'

type FindingFilter = 'all' | 'open' | 'resolved' | 'ignored' | 'enrichable' | 'enriched'
type SeverityFilter = '' | 'critical' | 'high' | 'medium' | 'low'
type EnrichmentState = 'none' | 'enriching' | 'enriched'

const BLOCKED_ENRICH_RULES = ['META-003']

function canEnrich(finding: Finding): boolean {
  if (BLOCKED_ENRICH_RULES.includes(finding.policyId)) return false

  const desc = finding.description?.toLowerCase() || ''
  if (desc.includes('opaque')) return false
  if (desc.includes('dynamic')) return false
  if (desc.includes('cannot evaluate')) return false
  if (desc.includes('non-literal')) return false
  if (desc.includes('unpack')) return false

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

const FINDINGS_PER_PAGE = 10

export default function RepoDetailPage() {
  const params = useParams()
  const slug = decodeURIComponent(params.id as string)
  const data = getRepoDetail(slug)

  const [findingFilter, setFindingFilter] = useState<FindingFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('')
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)
  const [findingsState, setFindingsState] = useState<Finding[]>(data.findings)
  const [findingsPage, setFindingsPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'findings' | 'surfaces' | 'activity'>('findings')

  const [selectedFindings, setSelectedFindings] = useState<Set<string>>(new Set())
  const [enrichmentStates, setEnrichmentStates] = useState<Record<string, EnrichmentState>>({})
  const [enrichmentProgress, setEnrichmentProgress] = useState<Record<string, number>>({})
  const enrichTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  useEffect(() => {
    const states: Record<string, EnrichmentState> = {}
    data.findings.forEach(f => {
      states[f.id] = f.enriched ? 'enriched' : 'none'
    })
    setEnrichmentStates(states)
    return () => {
      Object.values(enrichTimers.current).forEach(clearInterval)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getEnrichState = (id: string): EnrichmentState => enrichmentStates[id] || 'none'

  const enrichFinding = useCallback((findingId: string) => {
    setEnrichmentStates(prev => ({ ...prev, [findingId]: 'enriching' }))
    setEnrichmentProgress(prev => ({ ...prev, [findingId]: 0 }))

    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < 4) {
        setEnrichmentProgress(prev => ({ ...prev, [findingId]: step }))
      } else {
        clearInterval(interval)
        delete enrichTimers.current[findingId]
        setEnrichmentStates(prev => ({ ...prev, [findingId]: 'enriched' }))
        setFindingsState(prev => prev.map(f => {
          if (f.id !== findingId) return f
          const mock = generateMockEnrichment(f)
          return { ...f, enriched: true, ...mock }
        }))
      }
    }, 1200)

    enrichTimers.current[findingId] = interval
  }, [])

  const enrichSelected = useCallback(() => {
    selectedFindings.forEach(id => {
      const f = findingsState.find(fi => fi.id === id)
      if (f && getEnrichState(id) === 'none' && canEnrich(f)) enrichFinding(id)
    })
  }, [selectedFindings, enrichmentStates, findingsState, enrichFinding]) // eslint-disable-line react-hooks/exhaustive-deps

  const ignoreSelected = useCallback(() => {
    setFindingsState(prev => prev.map(f =>
      selectedFindings.has(f.id) && f.status === 'open' ? { ...f, status: 'ignored' as const } : f
    ))
    setSelectedFindings(new Set())
  }, [selectedFindings])

  const toggleFindingSelect = (id: string) => {
    setSelectedFindings(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    findingsState.forEach(f => { if (f.status === 'open') counts[f.severity]++ })
    return counts
  }, [findingsState])

  const enrichmentCounts = useMemo(() => {
    const counts = { enriched: 0, enriching: 0, not_enriched: 0 }
    findingsState.forEach(f => {
      const state = getEnrichState(f.id)
      if (state === 'enriched') counts.enriched++
      else if (state === 'enriching') counts.enriching++
      else counts.not_enriched++
    })
    return counts
  }, [findingsState, enrichmentStates]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredFindings = useMemo(() => {
    let list = findingsState
    if (findingFilter === 'enrichable') {
      list = list.filter(f => canEnrich(f) && getEnrichState(f.id) !== 'enriching')
    } else if (findingFilter === 'enriched') {
      list = list.filter(f => getEnrichState(f.id) === 'enriched')
    } else if (findingFilter !== 'all') {
      list = list.filter(f => f.status === findingFilter)
    }
    if (severityFilter) list = list.filter(f => f.severity === severityFilter)
    return [...list].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
  }, [findingsState, findingFilter, severityFilter, enrichmentStates]) // eslint-disable-line react-hooks/exhaustive-deps

  const findingsTotalPages = Math.max(1, Math.ceil(filteredFindings.length / FINDINGS_PER_PAGE))
  const paginatedFindings = filteredFindings.slice((findingsPage - 1) * FINDINGS_PER_PAGE, findingsPage * FINDINGS_PER_PAGE)

  const updateFindingStatus = (fId: string, status: 'resolved' | 'ignored') => {
    setFindingsState(prev => prev.map(f => f.id === fId ? { ...f, status } : f))
  }

  const allPageSelected = paginatedFindings.length > 0 && paginatedFindings.every(f => selectedFindings.has(f.id))
  const somePageSelected = paginatedFindings.some(f => selectedFindings.has(f.id))

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedFindings(prev => {
        const next = new Set(prev)
        paginatedFindings.forEach(f => next.delete(f.id))
        return next
      })
    } else {
      setSelectedFindings(prev => {
        const next = new Set(prev)
        paginatedFindings.forEach(f => next.add(f.id))
        return next
      })
    }
  }

  const filterTabs: { label: string; value: FindingFilter; count: number }[] = [
    { label: 'All', value: 'all', count: findingsState.length },
    { label: 'Open', value: 'open', count: findingsState.filter(f => f.status === 'open').length },
    { label: 'Enrichable', value: 'enrichable', count: findingsState.filter(f => canEnrich(f) && getEnrichState(f.id) !== 'enriching').length },
    { label: 'Enriched', value: 'enriched', count: findingsState.filter(f => getEnrichState(f.id) === 'enriched').length },
    { label: 'Resolved', value: 'resolved', count: findingsState.filter(f => f.status === 'resolved').length },
    { label: 'Ignored', value: 'ignored', count: findingsState.filter(f => f.status === 'ignored').length },
  ]

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="w-full max-w-[1120px] flex flex-col gap-4">

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">
          {/* Main content */}
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
                    {data.repo.framework} · {data.repo.language} · Last scan {data.activity.find(a => a.type === 'scan')?.timestamp ?? 'never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" icon={RefreshCw}>Re-scan</Button>
                <Button variant="secondary" icon={Download}>Export</Button>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex items-center justify-between">
              <Tabs
                tabs={[
                  { label: 'Findings', value: 'findings', badge: findingsState.length },
                  { label: 'Surfaces', value: 'surfaces', badge: data.surfaces.length },
                  { label: 'Activity', value: 'activity', badge: data.activity.length },
                ]}
                value={activeTab}
                onChange={(v) => setActiveTab(v as typeof activeTab)}
                variant="pill"
              />
              {activeTab === 'findings' && (
                <div className="w-[160px]">
                  <Dropdown
                    options={filterTabs.map(tab => ({ label: `${tab.label} (${tab.count})`, value: tab.value }))}
                    value={findingFilter}
                    onChange={(v) => { setFindingFilter(v as FindingFilter); setFindingsPage(1) }}
                  />
                </div>
              )}
            </div>

            {/* Findings tab */}
            {activeTab === 'findings' && (
              <div className="flex flex-col gap-3">

                {/* Bulk action bar */}
                {selectedFindings.size > 0 && (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-base)] border border-[var(--color-border-focus)] bg-[var(--color-bg-surface)]">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{selectedFindings.size} selected</span>
                    <div className="w-px h-4 bg-[var(--color-border-muted)]" />
                    <Button variant="secondary" size="sm" icon={Sparkles} onClick={enrichSelected}>Enrich selected</Button>
                    <Button variant="secondary" size="sm" icon={EyeOff} onClick={ignoreSelected}>Ignore selected</Button>
                    <Button variant="text" size="sm" onClick={() => setSelectedFindings(new Set())}>Deselect all</Button>
                  </div>
                )}

                {paginatedFindings.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
                    <div className="w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
                      <CheckCircle size={24} className="text-[var(--color-success-text)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">No findings detected</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">This repository passed all checks</p>
                  </div>
                ) : (
                  <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)]">
                    {/* Select-all header */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-raised)] border-b border-[var(--color-border-muted)] rounded-t-[var(--radius-base)]">
                      <Checkbox
                        checked={allPageSelected}
                        indeterminate={somePageSelected && !allPageSelected}
                        onChange={toggleSelectAll}
                      />
                      <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                        {allPageSelected ? 'Deselect all' : 'Select all'}
                      </span>
                    </div>

                    {paginatedFindings.map(finding => {
                      const isExpanded = expandedFinding === finding.id
                      const isDimmed = finding.status === 'resolved' || finding.status === 'ignored'
                      const eState = getEnrichState(finding.id)
                      const isSelected = selectedFindings.has(finding.id)
                      return (
                        <div key={finding.id} className={['border-b border-[var(--color-border-muted)] last:border-b-0 last:rounded-b-[var(--radius-base)]', isDimmed ? 'opacity-50' : ''].filter(Boolean).join(' ')}>
                          <div className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-[var(--color-bg-surface)] transition-colors">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox checked={isSelected} onChange={() => toggleFindingSelect(finding.id)} />
                            </div>
                            <button
                              onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                              className="flex items-center gap-3 flex-1 min-w-0 text-left"
                            >
                              <span className="text-[11px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: severityStyles[finding.severity].color }}>{severityStyles[finding.severity].label}</span>
                              <div className="w-px h-4 bg-[var(--color-border-muted)] flex-shrink-0" />
                              <div className="flex-1 flex items-center gap-2 min-w-0">
                                <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{finding.title}</span>
                                <Badge variant="neutral" size="sm">{finding.scope}</Badge>
                              </div>
                              {eState === 'enriching' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-accent-subtle)] text-[11px] font-medium text-[var(--color-accent-default)]">
                                  <Spinner size="sm" className="w-[10px] h-[10px]" />
                                  Enriching...
                                </span>
                              ) : (
                                <>
                                  <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono hidden sm:block">{finding.location}</code>
                                  {eState === 'enriched' && (
                                    <Badge variant="success" size="sm">Enriched</Badge>
                                  )}
                                  {finding.status !== 'open' && (
                                    <Badge variant={finding.status === 'resolved' ? 'success' : 'neutral'} size="sm">{finding.status}</Badge>
                                  )}
                                </>
                              )}
                              <ChevronDown size={14} className={['text-[var(--color-text-tertiary)] transition-transform', isExpanded ? 'rotate-180' : ''].join(' ')} />
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 flex flex-col gap-4 bg-[var(--color-bg-surface)]">

                              {/* Policy ID */}
                              <div className="flex flex-col gap-1.5 pt-2">
                                <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Policy ID</p>
                                <p className="text-sm text-[var(--color-text-primary)]">{finding.policyId}</p>
                              </div>

                              {/* Basic description + fix (always shown) */}
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

                              {/* STATE: Cannot enrich */}
                              {eState === 'none' && !canEnrich(finding) && (
                                <div className="rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] px-3 py-2.5 flex items-center gap-2.5">
                                  <Info size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                                  <span className="text-sm text-[var(--color-text-tertiary)]">Cannot be enriched — requires manual refactoring first</span>
                                </div>
                              )}


                              {/* STATE: Enriching — animated progress */}
                              {eState === 'enriching' && (
                                <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] p-3 flex flex-col gap-2">
                                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Enriching</p>
                                  {ENRICHMENT_STEPS.map((step, i) => {
                                    const progress = enrichmentProgress[finding.id] ?? 0
                                    const isActive = i === progress
                                    const isDone = i < progress
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
                                          isActive ? 'text-[var(--color-text-primary)]' : isDone ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-tertiary)]',
                                        ].join(' ')}>
                                          {step}
                                          {isActive && i === 0 ? ` (${finding.policyId})` : ''}
                                          {isActive && i === 1 ? ` — ${finding.tool_name}` : ''}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              {/* STATE: Enriched — show AI results */}
                              {eState === 'enriched' && finding.enriched && (
                                <>
                                  {/* Enrichment details divider */}
                                  <div className="flex items-center gap-3 pt-1">
                                    <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Enrichment Details</p>
                                    <div className="flex-1 h-px bg-[var(--color-border-muted)]" />
                                  </div>

                                  {/* AI explanation */}
                                  {finding.ai_explanation && (
                                    <div className="flex flex-col gap-1.5">
                                      <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">AI Explanation</p>
                                      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">{finding.ai_explanation}</p>
                                    </div>
                                  )}

                                  {/* Code diff */}
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

                              {/* Actions */}
                              {finding.status === 'open' && eState !== 'enriching' && <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border-muted)]">
                                {eState === 'none' && finding.status === 'open' && canEnrich(finding) && (
                                  <Tooltip content="Generate AI explanation, code fix, and diff" position="bottom">
                                    <Button variant="primary" size="sm" icon={Sparkles} onClick={() => enrichFinding(finding.id)}>Enrich</Button>
                                  </Tooltip>
                                )}
                                {finding.status === 'open' && (
                                  <Tooltip content="Mark as fixed externally — re-scan will verify" position="bottom">
                                    <Button variant="secondary" size="sm" icon={CheckCircle} onClick={() => updateFindingStatus(finding.id, 'resolved')}>Resolve</Button>
                                  </Tooltip>
                                )}
                                {finding.status === 'open' && (
                                  <Tooltip content="Dismiss this finding — won't fix" position="bottom">
                                    <Button variant="secondary" size="sm" icon={EyeOff} onClick={() => updateFindingStatus(finding.id, 'ignored')}>Ignore</Button>
                                  </Tooltip>
                                )}
                              </div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {filteredFindings.length > FINDINGS_PER_PAGE && (
                  <Pagination
                    currentPage={findingsPage}
                    totalPages={findingsTotalPages}
                    totalItems={filteredFindings.length}
                    pageSize={FINDINGS_PER_PAGE}
                    pageSizeOptions={[10]}
                    onPageChange={setFindingsPage}
                    onPageSizeChange={() => {}}
                  />
                )}
              </div>
            )}

            {/* Surfaces tab */}
            {activeTab === 'surfaces' && (
              <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden">
                {data.surfaces.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <p className="text-sm text-[var(--color-text-tertiary)]">No surfaces detected</p>
                  </div>
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
            {activeTab === 'activity' && (
              <div className="flex flex-col rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden px-5 py-4">
                {data.activity.map((item, i) => {
                  const iconMap = { scan: Shield, fix: CheckCircle, ignore: EyeOff, add: Circle }
                  const Icon = iconMap[item.type]
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center flex-shrink-0">
                          <Icon size={12} className="text-[var(--color-text-tertiary)]" />
                        </div>
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

          {/* Sidebar */}
          <div className="w-[280px] flex-shrink-0 sticky top-0 flex flex-col gap-4">

            {/* Scan info */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Scan Info</p>
              <code className="text-xs text-[var(--color-text-primary)] font-mono">{data.scan.id}</code>
              <div className="flex flex-wrap gap-1.5">
                {data.scan.tags.map(tag => (
                  <Badge key={tag} variant="neutral" size="sm">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Enrichment summary */}
            {findingsState.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Enrichment</p>
                <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-text)]" />
                      Enriched
                    </span>
                    <span className="text-[var(--color-text-primary)] font-medium">{enrichmentCounts.enriched}</span>
                  </div>
                  {enrichmentCounts.enriching > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-default)] animate-pulse" />
                        Enriching
                      </span>
                      <span className="text-[var(--color-text-primary)] font-medium">{enrichmentCounts.enriching}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-muted)]" />
                      Not enriched
                    </span>
                    <span className="text-[var(--color-text-primary)] font-medium">{enrichmentCounts.not_enriched}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Readiness */}
            {findingsState.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Readiness</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">Current</span>
                      <span className="text-xs font-medium" style={{ color: readinessColor(data.scan.readiness_fix_critical) }}>{data.scan.readiness_fix_critical}%</span>
                    </div>
                    <ProgressBar value={data.scan.readiness_fix_critical} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">After fixes</span>
                      <span className="text-xs font-medium" style={{ color: readinessColor(data.scan.readiness_fix_all) }}>{data.scan.readiness_fix_all}%</span>
                    </div>
                    <ProgressBar value={data.scan.readiness_fix_all} />
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown */}
            {findingsState.length > 0 && <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Breakdown</p>
              <div className="flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Severity</span>
                  <span className="text-[var(--color-text-primary)]">
                    crit {severityCounts.critical} · high {severityCounts.high} · med {severityCounts.medium}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scope</span>
                  <span className="text-[var(--color-text-primary)]">
                    skill {findingsState.filter(f => f.scope === 'skill').length} · agent {findingsState.filter(f => f.scope === 'agent').length} · tool {findingsState.filter(f => f.scope === 'tool').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Surfaces</span>
                  <span className="text-[var(--color-text-primary)]">{data.surfaces.length} surfaces</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="text-[var(--color-text-primary)]">
                    open {findingsState.filter(f => f.status === 'open').length} · resolved {findingsState.filter(f => f.status === 'resolved').length} · ignored {findingsState.filter(f => f.status === 'ignored').length}
                  </span>
                </div>
              </div>
            </div>}

            {/* Rule provenance */}
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
      </div>
    </main>
  )
}
