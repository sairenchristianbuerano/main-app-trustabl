'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ImportedRepo {
  id: string
  name: string
  language: string
  framework: string
  status: 'pass' | 'fail' | 'warning' | 'scanning'
  readiness: number
  findings: number
  lastScan: string
  lastScanBy: string
}

interface RepoContextValue {
  repos: ImportedRepo[]
  setRepos: React.Dispatch<React.SetStateAction<ImportedRepo[]>>
  githubConnected: boolean
  setGithubConnected: React.Dispatch<React.SetStateAction<boolean>>
}

const RepoContext = createContext<RepoContextValue | null>(null)

export type { ImportedRepo }

export function RepoProvider({ children, initialProvider }: { children: ReactNode; initialProvider: string }) {
  const [repos, setRepos] = useState<ImportedRepo[]>([])
  const [githubConnected, setGithubConnected] = useState(initialProvider === 'github')

  return (
    <RepoContext.Provider value={{ repos, setRepos, githubConnected, setGithubConnected }}>
      {children}
    </RepoContext.Provider>
  )
}

export function useRepos() {
  const ctx = useContext(RepoContext)
  if (!ctx) throw new Error('useRepos must be used within RepoProvider')
  return ctx
}
