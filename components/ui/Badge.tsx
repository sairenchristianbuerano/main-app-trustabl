type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral'
type BadgeShape = 'pill' | 'sharp'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  shape?: BadgeShape
  size?: BadgeSize
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  info:    'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  danger:  'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
  neutral: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)] border border-[var(--color-border-muted)]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
}

export function Badge({ variant = 'neutral', shape = 'pill', size = 'md', children }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center font-medium',
      shape === 'pill' ? 'rounded-[var(--radius-pill)]' : 'rounded-[var(--radius-sharp)]',
      variantStyles[variant],
      sizeStyles[size],
    ].join(' ')}>
      {children}
    </span>
  )
}
