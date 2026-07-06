import { DashboardGridSkeleton } from '@/components/patterns/DashboardSkeleton'

export default function Loading() {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
      <DashboardGridSkeleton />
    </main>
  )
}
