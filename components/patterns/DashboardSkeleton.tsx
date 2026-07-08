import { Skeleton } from '@/components/ui/Skeleton'

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col gap-0">
      <div className="flex gap-4 px-3 py-3 border-b border-[var(--color-border-muted)]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1" height={16} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-3 py-4 border-b border-[var(--color-border-muted)]">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1" height={16} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton width={128} height={16} />
            <Skeleton width={96} height={12} />
          </div>
          <Skeleton variant="circle" width={48} height={20} />
        </div>
        <Skeleton height={1} />
        <Skeleton width={80} height={16} />
        <Skeleton variant="rect" height={36} />
        <Skeleton variant="rect" height={36} />
      </div>
    </div>
  )
}

export function DashboardGridSkeleton() {
  return (
    <div className="w-full max-w-[1120px] mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton width={224} height={20} />
          <Skeleton width={288} height={14} />
        </div>
        <Skeleton variant="rect" width={144} height={42} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
            <Skeleton variant="rect" width={32} height={32} />
            <Skeleton width={64} height={24} />
            <Skeleton width={96} height={12} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
          <Skeleton width={128} height={16} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={40} />
          ))}
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
          <Skeleton width={112} height={16} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={36} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-4 flex flex-col gap-3">
            <Skeleton width={96} height={16} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} height={24} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyStateSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton variant="rect" width={48} height={48} />
        <Skeleton width={160} height={20} />
        <Skeleton width={224} height={16} />
        <Skeleton variant="rect" width={128} height={36} />
      </div>
    </div>
  )
}
