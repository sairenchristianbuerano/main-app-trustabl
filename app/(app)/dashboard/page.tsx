'use client'
import { useMemo, useState, useCallback, useEffect, type ElementType } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderGit2, AlertTriangle, Wrench, ChevronRight,
  Lock, Sparkles, Gauge,
  FolderPlus, ScanSearch, Loader2,
} from 'lucide-react'
import { Button, Badge, Avatar } from '@/components/ui'
import { useToast } from '@/components/ui/ToastContext'
import { DashboardGridSkeleton } from '@/components/patterns/DashboardSkeleton'
import { useRepos, type ImportedRepo } from '../repositories/RepoContext'
import { useSettings } from '../settings/SettingsContext'
import { useNotifications, type AppNotification } from '@/components/ui/NotificationContext'
import { getRepoDetail, type Finding } from '../repositories/[id]/mock-data'
import { AVAILABLE_REPOS } from '../repositories/available-repos'
import type { RepoItem } from '../repositories/RepoSelectorModal'
import { GitHubConnectModal } from '../repositories/GitHubConnectModal'
import { RepoSelectorModal } from '../repositories/RepoSelectorModal'

const CURRENT_USER = 'Zane F.'

const SEVERITY_CONFIG: { key: Finding['severity']; label: string; color: string; opacity?: number }[] = [
  { key: 'critical', label: 'CRIT', color: 'var(--color-danger-text)' },
  { key: 'high', label: 'HIGH', color: 'var(--color-warning-text)' },
  { key: 'medium', label: 'MED', color: 'var(--color-warning-text)', opacity: 0.55 },
  { key: 'low', label: 'LOW', color: 'var(--color-info-text)' },
]

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function readinessColor(value: number): string {
  if (value < 50) return 'var(--color-danger-text)'
  if (value <= 75) return 'var(--color-warning-text)'
  return 'var(--color-success-text)'
}

function relativeTime(ms: number): string {
  const diffMin = Math.max(0, Math.floor((Date.now() - ms) / 60000))
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const hr = Math.floor(diffMin / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

function notificationActor(n: AppNotification): string {
  if (n.type === 'fix_applied') return n.content.split(' applied')[0]
  if (n.type === 'team_invite_accepted') return n.content.split(' joined')[0]
  return CURRENT_USER
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, valueColor, subtext, dimmed }: {
  icon: ElementType; iconBg: string; iconColor: string
  label: string; value: React.ReactNode; valueColor?: string; subtext: React.ReactNode; dimmed?: boolean
}) {
  return (
    <div className={[
      'rounded-[var(--radius-card)] border bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3 min-h-[100px]',
      dimmed ? 'border-dashed border-[var(--color-border-muted)] opacity-60' : 'border-[var(--color-border-muted)]',
    ].join(' ')}>
      <div className="w-9 h-9 rounded-[var(--radius-base)] flex items-center justify-center" style={{ background: iconBg }}>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">{label}</span>
        <span className="text-2xl font-semibold" style={{ color: valueColor ?? 'var(--color-text-primary)' }}>{value}</span>
        <span className="text-xs text-[var(--color-text-tertiary)]">{subtext}</span>
      </div>
    </div>
  )
}

function WidgetHeader({ title, viewAllLabel, onViewAll, locked }: { title: string; viewAllLabel?: string; onViewAll?: () => void; locked?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-muted)]">
      <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-primary)]">
        {title}
        {locked && <Lock size={12} className="text-[var(--color-text-tertiary)]" />}
      </span>
      {onViewAll && (
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          {viewAllLabel ?? 'View all'} <ChevronRight size={12} />
        </button>
      )}
    </div>
  )
}

function LockedWidget({ title, icon: Icon, text, onEnable }: { title: string; icon: ElementType; text: string; onEnable: () => void }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden min-h-[180px]">
      <WidgetHeader title={title} locked />
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center">
        <div className="w-10 h-10 rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
          <Icon size={18} className="text-[var(--color-text-tertiary)]" />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-[220px] leading-relaxed">{text}</p>
        <Button variant="secondary" size="sm" onClick={onEnable}>Enable in Settings</Button>
      </div>
    </div>
  )
}

function StatusBanner({ repos, scanned, onConnect, onRunScan, onViewProgress }: {
  repos: ImportedRepo[]; scanned: ImportedRepo[]
  onConnect: () => void; onRunScan: (name: string) => void; onViewProgress: (name: string) => void
}) {
  const bannerClass = 'flex items-center justify-between gap-4 px-5 py-3.5 rounded-[var(--radius-card)] bg-[var(--color-bg-raised)]'
  const bannerStyle = { border: '1px solid color-mix(in srgb, var(--color-accent-default) 25%, transparent)' }

  if (repos.length === 0) {
    return (
      <div className={bannerClass} style={bannerStyle}>
        <div className="flex items-center gap-3">
          <FolderPlus size={18} className="text-[var(--color-accent-default)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-text-secondary)]">No repositories connected yet. Add your first repo to start scanning.</p>
        </div>
        <Button onClick={onConnect}>Connect repository</Button>
      </div>
    )
  }

  const scanningRepo = repos.find(r => r.scanner.status === 'scanning')
  if (scanningRepo) {
    return (
      <div className={bannerClass} style={bannerStyle}>
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="text-[var(--color-accent-default)] flex-shrink-0 animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Scanning {scanningRepo.name}... This usually takes a few minutes.</p>
        </div>
        <Button variant="secondary" onClick={() => onViewProgress(scanningRepo.name)}>View progress</Button>
      </div>
    )
  }

  if (scanned.length === 0) {
    return (
      <div className={bannerClass} style={bannerStyle}>
        <div className="flex items-center gap-3">
          <ScanSearch size={18} className="text-[var(--color-accent-default)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-text-secondary)]">{repos[0].name} connected. Run a scan to see your findings.</p>
        </div>
        <Button onClick={() => onRunScan(repos[0].name)}>Run scan</Button>
      </div>
    )
  }

  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const { repos, setRepos, githubConnected, setGithubConnected, getSession } = useRepos()
  const { enrichmentEnabled, autofixEnabled } = useSettings()
  const { notifications, startBatch } = useNotifications()
  const { toast } = useToast()

  const [connectOpen, setConnectOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleAddRepo = useCallback(() => {
    if (githubConnected) setSelectorOpen(true)
    else setConnectOpen(true)
  }, [githubConnected])

  const handleGitHubConnect = useCallback(() => {
    setGithubConnected(true)
    setConnectOpen(false)
    setSelectorOpen(true)
    toast('GitHub connected successfully')
  }, [setGithubConnected, toast])

  const handleImport = useCallback((imported: RepoItem[]) => {
    const newRepos: ImportedRepo[] = imported.map(r => ({
      id: r.id,
      name: r.name,
      language: r.language,
      framework: 'Unknown',
      scanner: { status: 'scanning' as const, readiness: null, findings_count: null, last_scan_at: 'In progress', last_scan_by: CURRENT_USER },
      autofix: { status: 'not_run' as const, fix_readiness: null, fixes_ready: null, fixes_applied: null, fixes_total: null, last_run_at: null, last_run_by: null },
      last_activity: { type: 'scan' as const, timestamp: 'In progress', by: CURRENT_USER },
      notifications_muted: false,
    }))
    if (newRepos.length >= 2) startBatch('scan', newRepos.map(r => r.id))
    setRepos(prev => [...prev, ...newRepos])
    setSelectorOpen(false)
    toast(`${imported.length} repositor${imported.length > 1 ? 'ies' : 'y'} imported successfully`)
  }, [setRepos, startBatch, toast])

  const availableToImport = useMemo(() => AVAILABLE_REPOS.filter(r => !repos.some(ir => ir.id === r.id)), [repos])

  // ─── Aggregate dashboard data from context (single source, no per-widget fetch) ───
  const scanned = useMemo(() => repos.filter(r => r.scanner.status !== 'not_scanned' && r.scanner.status !== 'scanning'), [repos])

  const failing = repos.filter(r => r.scanner.status === 'fail').length
  const healthy = repos.filter(r => r.scanner.status === 'pass').length

  const orgReadiness = useMemo(() => {
    const values = scanned.map(r => r.scanner.readiness).filter((v): v is number => v != null)
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null
  }, [scanned])

  const severityTotals = useMemo(() => {
    const totals: Record<Finding['severity'], number> = { critical: 0, high: 0, medium: 0, low: 0 }
    let total = 0
    for (const r of scanned) {
      const detail = getRepoDetail(r.name)
      for (const f of detail.findings) {
        if (f.status !== 'open') continue
        totals[f.severity]++
        total++
      }
    }
    return { totals, total }
  }, [scanned])

  const readyRepos = useMemo(() => repos.filter(r => r.autofix.status === 'ready' && (r.autofix.fixes_ready ?? 0) > 0), [repos])
  const pendingFixes = readyRepos.reduce((sum, r) => sum + (r.autofix.fixes_ready ?? 0), 0)

  const attention = useMemo(() =>
    repos
      .filter(r => r.scanner.status === 'fail' || r.scanner.status === 'warning')
      .sort((a, b) => (a.scanner.readiness ?? 0) - (b.scanner.readiness ?? 0)),
  [repos])

  const activity = useMemo(() => {
    if (repos.length === 0) return []
    return notifications
      .filter(n => autofixEnabled || !['autofix_completed', 'bulk_autofix_completed', 'fix_applied'].includes(n.type))
      .slice(0, 5)
  }, [notifications, autofixEnabled, repos.length])

  const enrichedByRepo = useMemo(() => {
    if (!enrichmentEnabled) return []
    const rows: { repo: ImportedRepo; count: number }[] = []
    for (const r of repos) {
      const states = getSession(r.name)?.enrichmentStates
      if (!states) continue
      const count = Object.values(states).filter(s => s === 'enriched').length
      if (count > 0) rows.push({ repo: r, count })
    }
    return rows.sort((a, b) => b.count - a.count)
  }, [repos, enrichmentEnabled, getSession])

  const maxSeverity = Math.max(1, ...SEVERITY_CONFIG.map(s => severityTotals.totals[s.key]))

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
        <DashboardGridSkeleton />
      </main>
    )
  }

  const noData = repos.length === 0
  const midWidget: 'enrichment-locked' | 'enriched' = enrichmentEnabled ? 'enriched' : 'enrichment-locked'
  const rightWidget: 'fixes-locked' | 'fixes' = autofixEnabled ? 'fixes' : 'fixes-locked'

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
      <div className="w-full max-w-[1120px] flex flex-col gap-4">

        {/* Welcome row */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">{greeting()}, {CURRENT_USER}</h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">Here&apos;s what&apos;s happening across your organization today.</p>
        </div>

        <StatusBanner
          repos={repos}
          scanned={scanned}
          onConnect={handleAddRepo}
          onRunScan={(name) => router.push(`/repositories/${encodeURIComponent(name)}`)}
          onViewProgress={() => router.push('/repositories?filter=scan:scanning')}
        />

        {/* Row 1: Stat cards */}
        <div className="grid grid-cols-4 gap-3 items-stretch">
          <StatCard
            icon={FolderGit2} iconBg="var(--color-info-bg)" iconColor="var(--color-info-text)"
            label="Repositories"
            value={noData ? '--' : repos.length}
            subtext={noData ? 'No data yet' : `${failing} failing · ${healthy} healthy`}
          />

          <StatCard
            icon={Gauge} iconBg="var(--color-accent-subtle)" iconColor="var(--color-accent-default)"
            label="Org Readiness"
            value={orgReadiness === null ? '--' : `${orgReadiness}%`}
            valueColor={orgReadiness === null ? undefined : readinessColor(orgReadiness)}
            subtext={noData ? 'No data yet' : orgReadiness === null ? 'No scans yet' : 'Awaiting trend data'}
          />

          <StatCard
            icon={AlertTriangle} iconBg="var(--color-danger-bg)" iconColor="var(--color-danger-text)"
            label="Total Findings"
            value={severityTotals.total > 0 ? severityTotals.total : (scanned.length === 0 ? '--' : 0)}
            valueColor={severityTotals.totals.critical > 0 ? 'var(--color-danger-text)' : undefined}
            subtext={noData ? 'No data yet' : scanned.length === 0 ? 'No scans yet' : `${severityTotals.totals.critical} critical · ${severityTotals.totals.high} high`}
          />

          <StatCard
            icon={Wrench}
            iconBg={autofixEnabled ? 'var(--color-success-bg)' : 'var(--color-bg-raised)'}
            iconColor={autofixEnabled ? 'var(--color-success-text)' : 'var(--color-text-tertiary)'}
            label="Fixes to Review"
            value={autofixEnabled ? (noData ? '--' : pendingFixes) : '--'}
            valueColor={autofixEnabled ? 'var(--color-success-text)' : undefined}
            subtext={autofixEnabled ? (noData ? 'No data yet' : `across ${readyRepos.length} repos`) : 'Autofix not enabled'}
            dimmed={!autofixEnabled}
          />
        </div>

        {/* Row 2: Repos + Activity */}
        <div className="grid grid-cols-2 gap-3 items-stretch">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden min-h-[200px]">
            <WidgetHeader title="Needs Attention" />
            {noData ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-10 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">No repositories connected yet</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Connect a repository to get started.</p>
              </div>
            ) : attention.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-10 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">All repositories are healthy</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">No findings need your attention right now.</p>
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto max-h-[320px]">
                {attention.map(repo => (
                  <button
                    key={repo.id}
                    onClick={() => router.push(`/repositories/${encodeURIComponent(repo.name)}`)}
                    className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-muted)] last:border-b-0 hover:bg-[var(--color-bg-raised)] transition-colors text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: repo.scanner.status === 'fail' ? 'var(--color-danger-text)' : 'var(--color-warning-text)' }}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{repo.name}</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">
                        {repo.framework} · {repo.language} · {repo.scanner.last_scan_at ?? '—'}
                      </span>
                    </div>
                    <Badge variant={repo.scanner.status === 'fail' ? 'danger' : 'warning'} size="sm">
                      {repo.scanner.status === 'fail' ? 'Fail' : 'Warn'} · {repo.scanner.readiness}%
                    </Badge>
                    <ChevronRight size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden min-h-[200px]">
            <WidgetHeader title="Recent Activity" />
            {activity.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-10 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">No activity yet</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Activity will appear here after your first scan.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {activity.map(n => (
                  <div key={n.id} className="flex items-start gap-2.5 px-4 py-3 border-b border-[var(--color-border-muted)] last:border-b-0">
                    <Avatar type="initials" initials={initialsOf(notificationActor(n))} size="md" />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs text-[var(--color-text-primary)] leading-relaxed">{n.content}</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">{relativeTime(n.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Severity + Enrichment + Fixes */}
        <div className="grid grid-cols-3 gap-3 items-stretch">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden min-h-[180px]">
            <WidgetHeader title="Findings by Severity" />
            {scanned.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-10 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">No findings yet</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Run a scan to see the severity breakdown.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4">
                {SEVERITY_CONFIG.map(s => {
                  const count = severityTotals.totals[s.key]
                  return (
                    <div key={s.key} className="flex items-center gap-2.5">
                      <span className="w-9 text-[11px] font-semibold text-[var(--color-text-tertiary)] flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2 rounded-[var(--radius-pill)] bg-[var(--color-border-muted)] overflow-hidden">
                        <div className="h-full rounded-[var(--radius-pill)] transition-[width] duration-300" style={{ width: `${(count / maxSeverity) * 100}%`, background: s.color, opacity: s.opacity }} />
                      </div>
                      <span className="w-6 text-xs text-[var(--color-text-secondary)] text-right flex-shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {midWidget === 'enrichment-locked' && (
            <LockedWidget
              title="Enrichment Insights" icon={Sparkles}
              text="Enable Enrichment to get AI-generated insights and code fixes."
              onEnable={() => router.push('/settings/integrations?highlight=enrichment')}
            />
          )}
          {midWidget === 'enriched' && (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden min-h-[180px]">
              <WidgetHeader title="Enriched Findings" />
              {enrichedByRepo.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-10 text-center">
                  <p className="text-sm text-[var(--color-text-secondary)]">No findings enriched yet.</p>
                </div>
              ) : (
                <div className="flex flex-col overflow-y-auto max-h-[320px]">
                  {enrichedByRepo.map(({ repo, count }) => (
                    <button
                      key={repo.id}
                      onClick={() => router.push(`/repositories/${encodeURIComponent(repo.name)}?filter=enriched`)}
                      className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--color-border-muted)] last:border-b-0 hover:bg-[var(--color-bg-raised)] transition-colors text-left"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{repo.name}</span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">{repo.framework} · {repo.language}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {rightWidget === 'fixes' && (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden min-h-[180px]">
              <WidgetHeader
                title="Fixes to Review"
                viewAllLabel={readyRepos.length > 0 ? 'View all' : undefined}
                onViewAll={readyRepos.length > 0 ? () => router.push('/repositories?filter=af:ready') : undefined}
              />
              {readyRepos.length === 0 ? (
                <div className="flex flex-col items-center gap-1 px-5 py-10 text-center">
                  <p className="text-sm text-[var(--color-text-secondary)]">No fixes pending review</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Run autofix on a repository to generate fixes.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {readyRepos.slice(0, 4).map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => router.push(`/repositories/${encodeURIComponent(repo.name)}?tab=autofix`)}
                      className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--color-border-muted)] last:border-b-0 hover:bg-[var(--color-bg-raised)] transition-colors text-left"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{repo.name}</span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">{repo.framework} · {repo.language}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{repo.autofix.fixes_ready}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {rightWidget === 'fixes-locked' && (
            <LockedWidget
              title="Fixes to Review" icon={Wrench}
              text="Enable Autofix to automatically generate code fixes for your findings."
              onEnable={() => router.push('/settings/integrations?highlight=autofix')}
            />
          )}
        </div>
      </div>

      <GitHubConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onSuccess={handleGitHubConnect} />
      <RepoSelectorModal open={selectorOpen} onClose={() => setSelectorOpen(false)} onImport={handleImport} repos={availableToImport} />
    </main>
  )
}
