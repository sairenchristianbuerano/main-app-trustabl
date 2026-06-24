import { TableSkeleton } from '@/components/patterns/DashboardSkeleton'

export default function Loading() {
  return (
    <main className="flex-1 overflow-hidden px-6 py-6 flex flex-col items-center">
      <TableSkeleton rows={5} cols={5} />
    </main>
  )
}
