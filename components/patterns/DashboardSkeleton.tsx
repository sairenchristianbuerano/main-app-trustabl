function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`rounded bg-[var(--color-bg-overlay)] animate-pulse ${className ?? ''}`}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col gap-0">
      <div className="flex gap-4 px-3 py-3 border-b border-[var(--color-border-muted)]">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-3 py-4 border-b border-[var(--color-border-muted)]">
          {Array.from({ length: cols }).map((_, j) => (
            <Pulse key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-6">
      <div className="rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Pulse className="h-10 w-10 rounded-full" />
          <div className="flex-1 flex flex-col gap-2">
            <Pulse className="h-4 w-32" />
            <Pulse className="h-3 w-24" />
          </div>
          <Pulse className="h-5 w-12 rounded-full" />
        </div>
        <Pulse className="h-px w-full" />
        <Pulse className="h-4 w-20" />
        <Pulse className="h-9 w-full rounded-md" />
        <Pulse className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}

export function EmptyStateSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Pulse className="h-12 w-12 rounded-lg" />
        <Pulse className="h-5 w-40" />
        <Pulse className="h-4 w-56" />
        <Pulse className="h-9 w-32 rounded-md" />
      </div>
    </div>
  )
}
