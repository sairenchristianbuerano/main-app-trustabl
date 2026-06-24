'use client'
import { FolderGit2 } from 'lucide-react'
import { EmptyState } from '@/components/patterns/EmptyState'

export default function DashboardPage() {
  const noop = () => {}

  return (
    <main className="flex-1 flex items-center justify-center">
      <EmptyState
        icon={FolderGit2}
        title="No repositories yet"
        description="Connect your first repository to start tracking and managing your projects."
        action={{ label: 'Add Repository', onClick: noop }}
      />
    </main>
  )
}
