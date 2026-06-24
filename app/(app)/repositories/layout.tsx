'use client'
import { RepoProvider } from './RepoContext'

const MOCK_PROVIDER = 'google'

export default function RepositoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RepoProvider initialProvider={MOCK_PROVIDER}>
      {children}
    </RepoProvider>
  )
}
