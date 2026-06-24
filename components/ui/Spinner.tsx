interface SpinnerProps {
  size?: 'sm' | 'md'
  className?: string
}

const sizeStyles = {
  sm: 'w-[14px] h-[14px] border-2',
  md: 'w-[20px] h-[20px] border-2',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'rounded-[var(--radius-pill)] border-[var(--color-border-muted)] border-t-[var(--color-text-primary)] animate-spin',
        sizeStyles[size],
        className,
      ].filter(Boolean).join(' ')}
    />
  )
}
