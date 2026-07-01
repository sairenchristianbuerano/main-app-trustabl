'use client'
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
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

export function RepoProvider({ children, initialProvider }: { children: ReactNode; initialProvider: string }) {
  const [repos, setRepos] = useState<ImportedRepo[]>([])
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
