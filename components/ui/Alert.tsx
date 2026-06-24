import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  variant?: AlertVariant
  title: string
  description?: string
  onDismiss?: () => void
}

const icons: Record<AlertVariant, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
}

export function Alert({ variant = 'info', title, description, onDismiss }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-base)] border-l-[3px] border-l-[var(--color-border-muted)] bg-[var(--color-bg-surface)] w-full"
    >
      <Icon size={16} className="text-[var(--color-text-primary)] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
        {description && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss alert" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
