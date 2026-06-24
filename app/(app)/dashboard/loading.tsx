import { EmptyStateSkeleton } from '@/components/patterns/DashboardSkeleton'

export default function Loading() {
  return (
    <main className="flex-1 overflow-hidden flex items-center justify-center p-6">
      <EmptyStateSkeleton />
    </main>
  )
}
