interface CardProps {
  variant?: 'default' | 'interactive'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

interface CardHeaderProps { children: React.ReactNode; className?: string }
interface CardBodyProps { children: React.ReactNode; className?: string }
interface CardFooterProps { children: React.ReactNode; className?: string }

export function Card({ variant = 'default', className, children, onClick }: CardProps) {
  const isInteractive = variant === 'interactive' && !!onClick
  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } } : undefined}
      className={[
        'rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] overflow-hidden flex flex-col',
        isInteractive
          ? 'cursor-pointer transition-[border-color,background] duration-150 hover:border-[var(--color-border-focus)] hover:bg-[var(--color-bg-overlay)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]'
          : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={['flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-muted)]', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={['p-4 text-sm text-[var(--color-text-secondary)] flex-1', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={['flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-muted)]', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
