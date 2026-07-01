'use client'
import { ArrowLeft, User, Building2, Users, Plug } from 'lucide-react'
import { NavItem } from '@/components/ui'

const sectionItems = [
  { label: 'Account', value: 'account', icon: User },
  { label: 'Organization', value: 'organization', icon: Building2 },
  { label: 'Members', value: 'members', icon: Users },
  { label: 'Integrations', value: 'integrations', icon: Plug },
]

interface SettingsSidebarProps {
  activeValue: string
  onNavigate: (value: string) => void
  onBack: () => void
}

export function SettingsSidebar({ activeValue, onNavigate, onBack }: SettingsSidebarProps) {
  return (
    <div
      className="flex flex-col h-screen bg-[var(--color-bg-surface)] border-r border-[var(--color-border-muted)] overflow-hidden"
      style={{ width: 220, minWidth: 220 }}
    >
      <div className="h-[52px] flex-shrink-0 flex items-center border-b border-[var(--color-border-muted)] px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[var(--radius-sharp)] text-sm font-medium text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-secondary)] transition-[background,color] duration-150"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 pt-4 px-2 overflow-y-auto">
        {sectionItems.map(item => (
          <NavItem
            key={item.value}
            label={item.label}
            icon={item.icon}
            active={activeValue === item.value}
            onClick={() => onNavigate(item.value)}
          />
        ))}
      </div>
    </div>
  )
}
