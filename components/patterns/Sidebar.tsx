'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronsUpDown, PanelLeft, Settings, LogOut, Mail, BookOpen, ArrowUpRight, Sparkles } from 'lucide-react'
import { NavItem, Divider } from '@/components/ui'

function SidebarTooltip({ label, show, children }: { label: string; show: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!show) return <>{children}</>

  const handleEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 })
      }
      setVisible(true)
    }, 200)
  }

  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {visible && (
        <div
          className="fixed px-2.5 py-1.5 rounded-[var(--radius-sharp)] bg-[var(--color-bg-overlay)] border border-[var(--color-border-muted)] shadow-[var(--shadow-float)] text-xs font-medium text-[var(--color-text-primary)] whitespace-nowrap pointer-events-none animate-[tooltipFadeIn_150ms_ease-out]"
          style={{ zIndex: 'var(--z-dropdown)', top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

function GithubIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function DiscordIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  )
}



interface SidebarItem {
  label: string
  value: string
  icon?: React.ElementType
}

interface SidebarProps {
  items: SidebarItem[]
  activeValue: string
  onNavigate: (value: string) => void
  onNewComponent?: () => void
  onCollapse?:     (collapsed: boolean) => void
  onProfileClick?: () => void
  onLogout?: () => void
  onAccount?: () => void
  onViewPlans?: () => void
  onContactUs?: () => void
  brand?: string
  username?: string
}

export function Sidebar({
  items, activeValue, onNavigate, onNewComponent, onCollapse, onProfileClick, onLogout, onAccount, onViewPlans, onContactUs, brand = 'ComponentFactory', username,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const headerBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggle = (v: boolean) => { setCollapsed(v); onCollapse?.(v) }

  const toggleHeaderMenu = () => {
    if (!menuOpen && headerBtnRef.current) {
      const rect = headerBtnRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 4,
        left: 4,
      })
    }
    setMenuOpen(v => !v)
  }

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          headerBtnRef.current && !headerBtnRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const sidebarWidth = collapsed ? 52 : 220

  return (
    <div
      className="flex flex-col h-screen bg-[var(--color-bg-surface)] border-r border-[var(--color-border-muted)] overflow-hidden overflow-x-hidden"
      style={{ width: sidebarWidth, minWidth: sidebarWidth, transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className={['h-[52px] flex-shrink-0 flex items-center border-b border-[var(--color-border-muted)] overflow-hidden', collapsed ? 'justify-center' : 'pl-1.5 pr-1.5'].join(' ')}>
        {collapsed ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => toggle(false)}
              aria-label="Expand sidebar"
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sharp)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] transition-[background,color] duration-150"
            >
              <PanelLeft size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              ref={headerBtnRef}
              onClick={toggleHeaderMenu}
              className="flex items-center gap-2 min-w-0 hover:bg-[var(--color-bg-overlay)] rounded-[var(--radius-sharp)] pl-1.5 pr-1.5 py-1 transition-[background] duration-150"
            >
              <div className="w-7 h-7 min-w-[28px] rounded-[var(--radius-sharp)] bg-[var(--color-accent-default)] flex items-center justify-center text-[11px] font-bold text-[var(--color-bg-page)]">
                {(username ?? brand)?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate whitespace-nowrap">{username ?? brand}</span>
              <ChevronsUpDown size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
            </button>
            <button
              onClick={() => toggle(true)}
              aria-label="Collapse sidebar"
              className="w-7 h-7 ml-auto flex-shrink-0 flex items-center justify-center rounded-[var(--radius-sharp)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] transition-[background,color] duration-150"
            >
              <PanelLeft size={14} />
            </button>
          </>
        )}
      </div>

      <div className={['flex-1 flex flex-col gap-0.5 pt-4 pb-1 overflow-y-auto overflow-x-hidden', collapsed ? 'items-center' : 'px-2'].join(' ')}>
        {items.map(item => {
          const Icon = item.icon
          const isActive = activeValue === item.value
          return (
            <SidebarTooltip key={item.value} label={item.label} show={collapsed}>
              <button
                onClick={() => onNavigate(item.value)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center h-9 rounded-[var(--radius-sharp)] text-sm font-medium whitespace-nowrap',
                  'transition-[background,color,opacity] duration-150',
                  collapsed ? 'justify-center w-9 p-0' : 'w-full gap-2.5 px-3',
                  isActive
                    ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] shadow-[inset_0_0_0_1px_var(--color-border-muted)]'
                    : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]',
                ].join(' ')}
              >
                {Icon && <Icon size={16} className="flex-shrink-0" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </SidebarTooltip>
          )
        })}
      </div>

      <div className={['flex flex-col gap-1 pb-2 border-t border-[var(--color-border-muted)] pt-2', collapsed ? 'items-center' : 'px-2'].join(' ')}>
        {false && !collapsed && (
          <div className="rounded-[var(--radius-sharp)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] p-3 flex flex-col gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--color-accent-default)]" />
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Unlock unlimited repos, advanced analytics, and priority support.
            </p>
            <button onClick={onViewPlans} className="w-full h-7 rounded-[var(--radius-sharp)] bg-[var(--color-accent-default)] text-[11px] font-medium text-[var(--color-bg-page)] hover:bg-[var(--color-accent-hover)] transition-[background] duration-150">
              View plans
            </button>
          </div>
        )}
        {([
          { label: 'GitHub', icon: GithubIcon, onClick: () => window.open('https://github.com/trustabl/trustabl', '_blank') },
          { label: 'Contact Us', icon: Mail, onClick: onContactUs },
          { label: 'Documentation', icon: BookOpen, onClick: undefined as (() => void) | undefined },
        ]).map(item => (
          <SidebarTooltip key={item.label} label={item.label} show={collapsed}>
            <button
              aria-label={item.label}
              onClick={item.onClick}
              className={[
                'group/link flex items-center h-8 rounded-[var(--radius-sharp)] text-xs font-medium whitespace-nowrap',
                'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]',
                'transition-[background,color] duration-150',
                collapsed ? 'justify-center w-8 p-0' : 'w-full gap-2.5 px-3',
              ].join(' ')}
            >
              <item.icon size={14} className="flex-shrink-0" />
              {!collapsed && <>
                <span className="truncate flex-1 text-left">{item.label}</span>
                <ArrowUpRight size={12} className="flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-150" />
              </>}
            </button>
          </SidebarTooltip>
        ))}
      </div>

      {/* Workspace menu — fixed to escape overflow */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] overflow-hidden animate-[fadeScale_150ms_ease-out]"
          style={{ zIndex: 'var(--z-dropdown)', top: menuPos.top, left: menuPos.left, width: 220 }}
        >
          {/* User header */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            <div className="w-8 h-8 min-w-[32px] rounded-[var(--radius-sharp)] bg-[var(--color-accent-default)] flex items-center justify-center text-xs font-bold text-[var(--color-bg-page)]">
              {(username ?? brand)?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-[var(--color-text-tertiary)] truncate">Organization</span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{username ?? brand}</span>
            </div>
          </div>
          <Divider />
          <button
            onClick={() => { onAccount?.(); setMenuOpen(false) }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
          >
            <Settings size={16} />
            Settings
          </button>
          <Divider />
          <button
            onClick={() => { onLogout?.(); setMenuOpen(false) }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[var(--color-danger-text)] hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
