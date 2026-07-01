interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

interface FormLayoutProps {
  title: string
  onSubmit: (e: React.FormEvent) => void
  footer?: React.ReactNode
  children: React.ReactNode
  maxWidth?: number
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">{title}</p>
        {description && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function FormLayout({ title, onSubmit, footer, children, maxWidth = 640 }: FormLayoutProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] overflow-hidden"
      style={{ maxWidth }}
    >
      <div className="px-5 py-[18px] border-b border-[var(--color-border-muted)]">
        <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {children}
      </div>

      {footer && (
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--color-border-muted)]">
          {footer}
        </div>
      )}
    </form>
  )
}
