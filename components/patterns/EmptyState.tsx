import { Button } from '@/components/ui'

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'ghost' }
  danger?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, danger }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-12 text-center rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
      <div className={[
        'w-14 h-14 rounded-[var(--radius-card)] flex items-center justify-center',
        danger
          ? 'bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)]'
          : 'bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)]',
      ].join(' ')}>
        <Icon size={24} className={danger ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-tertiary)]'} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-[280px] leading-relaxed">{description}</p>
      </div>
      {action && (
        <Button variant={action.variant ?? 'primary'} onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  )
}
