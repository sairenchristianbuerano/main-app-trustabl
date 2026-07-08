'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ScanLine, Wrench, UserPlus, Check, Inbox } from 'lucide-react'
import { useNotifications, type AppNotification, type NotificationType } from './NotificationContext'

type IconCfg = {
  icon: React.ElementType
  bgStyle: React.CSSProperties
  iconStyle: React.CSSProperties
  bulk: boolean
}

const TYPE_CONFIG: Record<NotificationType, IconCfg> = {
  scan_completed: {
    icon: ScanLine,
    bgStyle: { backgroundColor: 'var(--color-accent-subtle)' },
    iconStyle: { color: 'var(--color-accent-default)' },
    bulk: false,
  },
  bulk_scan_completed: {
    icon: ScanLine,
    bgStyle: { backgroundColor: 'var(--color-accent-subtle)' },
    iconStyle: { color: 'var(--color-accent-default)' },
    bulk: true,
  },
  autofix_completed: {
    icon: Wrench,
    bgStyle: { backgroundColor: 'var(--color-ai-bg)' },
    iconStyle: { color: 'var(--color-ai-text)' },
    bulk: false,
  },
  bulk_autofix_completed: {
    icon: Wrench,
    bgStyle: { backgroundColor: 'var(--color-ai-bg)' },
    iconStyle: { color: 'var(--color-ai-text)' },
    bulk: true,
  },
  team_invite_accepted: {
    icon: UserPlus,
    bgStyle: { backgroundColor: 'var(--color-success-bg)' },
    iconStyle: { color: 'var(--color-success-text)' },
    bulk: false,
  },
  fix_applied: {
    icon: Check,
    bgStyle: { backgroundColor: 'var(--color-success-bg)' },
    iconStyle: { color: 'var(--color-success-text)' },
    bulk: false,
  },
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr${hr > 1 ? 's' : ''} ago`
  const day = Math.floor(hr / 24)
  return `${day} day${day > 1 ? 's' : ''} ago`
}

function linkToHref(link: AppNotification['link']): string {
  if (link.page === 'repositories' && link.params?.repo) {
    return `/repositories/${encodeURIComponent(link.params.repo)}${link.params.tab ? `?tab=${link.params.tab}` : ''}`
  }
  return `/${link.page}`
}

export function NotificationBell() {
  const router = useRouter()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const visible = notifications.slice(0, 10)

  const handleItemClick = (n: AppNotification) => {
    markRead(n.id)
    setOpen(false)
    router.push(linkToHref(n.link))
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        className="relative p-1.5 rounded-[var(--radius-sharp)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-raised)] transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-[var(--radius-pill)] bg-[var(--color-danger-text)] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 right-0 w-[320px] rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] flex flex-col overflow-hidden animate-[fadeScale_150ms_ease-out]"
          style={{ zIndex: 'var(--z-dropdown)', maxHeight: 400 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-muted)] flex-shrink-0">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors duration-[var(--duration-base)]"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 px-4">
              <Inbox size={24} className="text-[var(--color-text-tertiary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 352, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {visible.map(n => {
                const cfg = TYPE_CONFIG[n.type]
                const Icon = cfg.icon
                const batchCount = n.batch_summary?.total

                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={[
                      'flex items-start gap-2.5 w-full px-3 py-3 text-left',
                      'border-b border-[var(--color-border-muted)] last:border-b-0',
                      'hover:bg-[var(--color-bg-raised)] transition-colors duration-[var(--duration-base)]',
                      !n.read ? 'bg-[var(--color-bg-surface)]' : '',
                    ].join(' ')}
                  >
                    {/* Icon container */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div
                        className="w-7 h-7 rounded-[var(--radius-sharp)] flex items-center justify-center"
                        style={cfg.bgStyle}
                      >
                        <Icon size={14} style={cfg.iconStyle} />
                      </div>
                      {cfg.bulk && batchCount != null && (
                        <span
                          className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-[3px] rounded-[var(--radius-pill)] text-[9px] font-bold flex items-center justify-center leading-none border border-[var(--color-border-muted)]"
                          style={{ backgroundColor: 'var(--color-bg-raised)', color: 'var(--color-text-secondary)' }}
                        >
                          {batchCount}
                        </span>
                      )}
                    </div>

                    {/* Text + timestamp */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] leading-snug"
                        style={{
                          fontWeight: !n.read ? 600 : 400,
                          color: !n.read ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {n.content}
                      </p>
                      <p className="text-[11px] mt-1 text-[var(--color-text-tertiary)]">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
