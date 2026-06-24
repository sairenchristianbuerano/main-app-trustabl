interface Tab {
  label: string
  value: string
  icon?: React.ElementType
  badge?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  value: string
  onChange: (value: string) => void
  variant?: 'underline' | 'pill'
}

export function Tabs({ tabs, value, onChange, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div role="tablist" className="flex items-center gap-0.5 p-1 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = tab.value === value
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.value)}
              className={[
                'flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--radius-sharp)] text-sm font-medium',
                'transition-[background,color] duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isActive
                  ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              ].filter(Boolean).join(' ')}
            >
              {Icon && <Icon size={14} />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={['text-[11px] font-medium px-1.5 py-0.5 rounded-full border', isActive ? 'text-[var(--color-text-primary)] bg-[var(--color-border-muted)] border-[var(--color-border-focus)]' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border-[var(--color-border-muted)]'].join(' ')}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div role="tablist" className="flex items-center border-b border-[var(--color-border-muted)]">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={[
              'flex items-center gap-1.5 h-10 px-3.5 text-sm font-medium -mb-px',
              'border-b-2 transition-[color,border-color] duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              isActive
                ? 'text-[var(--color-text-primary)] border-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] border-transparent hover:text-[var(--color-text-secondary)]',
            ].filter(Boolean).join(' ')}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={['text-[11px] font-medium px-1.5 py-0.5 rounded-full border', isActive ? 'text-[var(--color-text-primary)] bg-[var(--color-border-muted)] border-[var(--color-border-focus)]' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-raised)] border-[var(--color-border-muted)]'].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
