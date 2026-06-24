import { Divider } from '@/components/ui'

interface ToolbarTab {
  label: string
  value: string
  icon?: React.ElementType
  badge?: number
}

interface ToolbarAction {
  icon?: React.ElementType
  label?: string
  onClick: () => void
  active?: boolean
  'aria-label'?: string
}

interface ToolbarProps {
  tabs?: ToolbarTab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  actions?: ToolbarAction[]
  primaryAction?: { label: string; onClick: () => void }
}

export function Toolbar({ tabs, activeTab, onTabChange, actions, primaryAction }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] w-fit">
      {tabs?.map(tab => {
        const Icon = tab.icon
        const isActive = tab.value === activeTab
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange?.(tab.value)}
            className={[
              'flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--radius-sharp)] text-sm font-medium transition-[background,color] duration-150',
              isActive
                ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            ].join(' ')}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={['text-[11px] font-medium px-1.5 py-px rounded-full border', isActive ? 'text-[var(--color-text-primary)] bg-[var(--color-border-muted)] border-[var(--color-border-focus)]' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border-[var(--color-border-muted)]'].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}

      {tabs && actions && <Divider orientation="vertical" className="mx-1" />}

      {actions?.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={i}
            onClick={action.onClick}
            aria-label={action['aria-label'] ?? action.label}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] text-sm font-medium transition-[background,color] duration-150',
              action.active
                ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-raised)] hover:text-[var(--color-text-primary)]',
            ].join(' ')}
          >
            {Icon ? <Icon size={16} /> : action.label}
          </button>
        )
      })}

      {primaryAction && (
        <>
          {(tabs || actions) && <Divider orientation="vertical" className="mx-1" />}
          <button
            onClick={primaryAction.onClick}
            className="flex items-center h-8 px-3 rounded-[var(--radius-sharp)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-raised)] hover:text-[var(--color-text-primary)] transition-[background,color] duration-150"
          >
            {primaryAction.label}
          </button>
        </>
      )}
    </div>
  )
}
