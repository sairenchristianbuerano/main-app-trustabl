interface NavItemProps {
  label: string
  icon?: React.ElementType
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

export function NavItem({ label, icon: Icon, active, disabled, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center gap-2.5 h-9 w-full px-3 rounded-[var(--radius-sharp)] text-sm font-medium',
        'transition-[background,color] duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
          : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]',
      ].filter(Boolean).join(' ')}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  )
}
