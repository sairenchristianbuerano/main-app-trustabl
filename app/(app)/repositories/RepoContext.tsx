'use client'
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { MOCK_DETAILS } from './[id]/mock-data'
import { getAutofixRepos } from '../autofix/mock-data'
import type { Finding } from './[id]/mock-data'
import type { AutofixFinding, AutofixSession, AttestationData } from '../autofix/mock-data'

type ScanStatus = 'not_scanned' | 'scanning' | 'pass' | 'fail' | 'warning'
type AutofixStatus = 'not_run' | 'running' | 'ready' | 'all_applied' | 'rejected'
type EnrichmentState = 'none' | 'enriching' | 'enriched' | 'failed'

interface ImportedRepo {
  id: string
  name: string
  language: string
  framework: string
  scanner: {
    status: ScanStatus
    readiness: number | null
    findings_count: number | null
    last_scan_at: string | null
    last_scan_by: string | null
  }
  autofix: {
    status: AutofixStatus
    fix_readiness: number | null
    fixes_ready: number | null
    fixes_applied: number | null
    fixes_total: number | null
    last_run_at: string | null
    last_run_by: string | null
  }
  last_activity: {
    type: 'scan' | 'autofix' | null
    timestamp: string | null
    by: string | null
  }
  notifications_muted: boolean
}

interface RepoSessionState {
  // Scanner
  findingsState: Finding[]
  enrichmentStates: Record<string, EnrichmentState>
  enrichmentProgress: Record<string, number>
  activeFilters: string[]
  findingsSearch: string
  activeSubTab: 'findings' | 'surfaces' | 'activity'

  // Autofix
  afPageState: 'empty' | 'running' | 'results'
  afSession: AutofixSession | null
  afFindings: AutofixFinding[]
  afFilters: string[]
  afSubTab: 'findings' | 'activity'
  afFindingsSearch: string
  attestation: AttestationData | null
}

interface RepoContextValue {
  repos: ImportedRepo[]
  setRepos: React.Dispatch<React.SetStateAction<ImportedRepo[]>>
  githubConnected: boolean
  setGithubConnected: React.Dispatch<React.SetStateAction<boolean>>
  toggleMute: (id: string) => void
  getSession: (slug: string) => Partial<RepoSessionState> | undefined
  updateSession: (slug: string, state: Partial<RepoSessionState>) => void
  clearSession: (slug: string) => void
}

const RepoContext = createContext<RepoContextValue | null>(null)

export type { ImportedRepo, RepoSessionState, EnrichmentState }

function buildInitialRepos(): ImportedRepo[] {
  const afRepos = getAutofixRepos()
  return Object.entries(MOCK_DETAILS).map(([name, detail], i) => {
    const d = detail.repo
    const scanStatus: ScanStatus = d.gate_status === 'pass' ? 'pass' : d.readiness_score >= 50 ? 'warning' : 'fail'
    const af = afRepos.find(r => r.repo_name === name)
    let afStatus: AutofixStatus = 'not_run'
    let fixReadiness: number | null = null
    let fixesReady: number | null = null
    let fixesApplied: number | null = null
    let fixesTotal: number | null = null
    let afLastAt: string | null = null
    let afLastBy: string | null = null
    if (af && af.autofix_status !== 'not_run') {
      const total = af.fixes_ready + af.fixes_applied + af.fixes_rejected
      fixesApplied = af.fixes_applied
      fixesReady = af.fixes_ready
      fixesTotal = total
      fixReadiness = total > 0 ? Math.round((af.fixes_applied / total) * 100) : 0
      afLastAt = af.last_run_at
      afLastBy = af.last_run_by
      if (af.autofix_status === 'completed') afStatus = 'all_applied'
      else if (af.autofix_status === 'ready') afStatus = fixReadiness >= 100 ? 'all_applied' : 'ready'
      else if (af.autofix_status === 'running') afStatus = 'running'
    }
    const lastScan = detail.activity.find(a => a.type === 'scan')
    const lastAf = afLastAt ? { type: 'autofix' as const, timestamp: afLastAt, by: afLastBy } : null
    const lastScanAct = lastScan ? { type: 'scan' as const, timestamp: lastScan.timestamp, by: lastScan.user } : null
    const lastActivity = lastAf || lastScanAct || { type: null, timestamp: null, by: null }
    return {
      id: String(i + 1),
      name,
      language: d.language,
      framework: d.framework,
      scanner: {
        status: scanStatus,
        readiness: d.readiness_score,
        findings_count: d.findings_count,
        last_scan_at: lastScan?.timestamp ?? null,
        last_scan_by: lastScan?.user ?? null,
      },
      autofix: {
        status: afStatus,
        fix_readiness: fixReadiness,
        fixes_ready: fixesReady,
        fixes_applied: fixesApplied,
        fixes_total: fixesTotal,
        last_run_at: afLastAt,
        last_run_by: afLastBy,
      },
      last_activity: lastActivity,
      notifications_muted: false,
    }
  })
}

export function RepoProvider({ children, initialProvider }: { children: ReactNode; initialProvider: string }) {
  const [repos, setRepos] = useState<ImportedRepo[]>(() => buildInitialRepos())
  const [githubConnected, setGithubConnected] = useState(true)
  const sessionsRef = useRef<Map<string, Partial<RepoSessionState>>>(new Map())

  const getSession = useCallback((slug: string) => {
    return sessionsRef.current.get(slug)
  }, [])

  const updateSession = useCallback((slug: string, state: Partial<RepoSessionState>) => {
    const existing = sessionsRef.current.get(slug) || {}
    sessionsRef.current.set(slug, { ...existing, ...state })
  }, [])

  const clearSession = useCallback((slug: string) => {
    sessionsRef.current.delete(slug)
  }, [])

  const toggleMute = useCallback((id: string) => {
    setRepos(prev => prev.map(r => r.id === id ? { ...r, notifications_muted: !r.notifications_muted } : r))
  }, [])

  return (
    <RepoContext.Provider value={{ repos, setRepos, githubConnected, setGithubConnected, toggleMute, getSession, updateSession, clearSession }}>
      {children}
    </RepoContext.Provider>
  )
}

export function useRepos() {
  const ctx = useContext(RepoContext)
  if (!ctx) throw new Error('useRepos must be used within RepoProvider')
  return ctx
}
