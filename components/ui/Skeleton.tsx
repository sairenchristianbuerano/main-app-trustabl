interface SkeletonProps {
  variant?: 'line' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ variant = 'line', width = '100%', height = 14, className }: SkeletonProps) {
  const radiusMap = {
    line: 'rounded-[var(--radius-sharp)]',
    circle: 'rounded-[var(--radius-pill)]',
    rect: 'rounded-[var(--radius-base)]',
  }

  return (
    <div
      aria-hidden="true"
      className={[
        'animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--color-bg-surface)] via-[var(--color-bg-raised)] to-[var(--color-bg-surface)] bg-[length:800px_100%]',
        radiusMap[variant],
        className,
      ].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  )
}
