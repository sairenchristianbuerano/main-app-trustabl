'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Gauge, FolderGit2, ChevronRight, RotateCcw } from 'lucide-react'
import { RepoProvider } from '@/app/(app)/repositories/RepoContext'
import { SettingsProvider } from '@/app/(app)/settings/SettingsContext'
import { Sidebar } from '@/components/patterns/Sidebar'
import { SettingsSidebar } from '@/components/patterns/SettingsSidebar'
import { Modal, Button, Dropdown, NotificationBell } from '@/components/ui'
import { useToast } from '@/components/ui/ToastContext'

const navItems = [
  { label: 'Dashboard', value: 'dashboard', icon: Gauge },
  { label: 'Repositories', value: 'repositories', icon: FolderGit2 },
]

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  repositories: 'Repositories',
  autofix: 'Repositories',
  settings: 'Settings',
}

const subjectOptions = [
  { label: 'Bug', value: 'Bug' },
  { label: 'Feature', value: 'Feature' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Other', value: 'Other' },
]

const MOCK_PROVIDER = 'google'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const [contactOpen, setContactOpen] = useState(false)
  const [contactSubject, setContactSubject] = useState('Bug')
  const [contactMessage, setContactMessage] = useState('')

  const handleCloseContact = () => {
    setContactOpen(false)
    setContactSubject('Bug')
    setContactMessage('')
  }

  const handleSendContact = () => {
    if (!contactMessage.trim()) return
    handleCloseContact()
    toast('Message sent. We\'ll get back to you soon.')
  }

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  const segments = pathname.split('/').filter(Boolean)
  const activeValue = segments[0] || ''
  const isSettings = activeValue === 'settings'
  const title = pageTitles[activeValue] || ''
  const isSubpage = (activeValue === 'repositories' || activeValue === 'autofix') && segments.length > 1

  useEffect(() => {
    if (!isSettings) sessionStorage.setItem('settings_back_path', pathname)
  }, [pathname, isSettings])

  const handleSettingsBack = () => {
    router.push(sessionStorage.getItem('settings_back_path') || '/repositories')
  }

  const settingsSection = segments[1] || 'account'
  const settingsTitle = 'Settings'

  return (
    <SettingsProvider>
    <RepoProvider initialProvider={MOCK_PROVIDER}>
    <div className="flex h-screen w-screen bg-[var(--color-bg-page)] overflow-hidden">
      <div className="flex-shrink-0 overflow-hidden">
        {isSettings ? (
          <SettingsSidebar
            activeValue={settingsSection}
            onNavigate={(v) => router.push(`/settings/${v}`)}
            onBack={handleSettingsBack}
          />
        ) : (
          <Sidebar
            items={navItems}
            activeValue={activeValue}
            onNavigate={(v) => router.push(`/${v}`)}
            brand="trustabl"
            username="Trustabl"
            onLogout={() => router.push('/')}
            onAccount={() => router.push('/settings')}
            onContactUs={() => setContactOpen(true)}
          />
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-shrink-0 h-[52px] flex items-center justify-between border-b border-[var(--color-border-muted)] px-6" style={{ zIndex: 'var(--z-overlay)' }}>
          {isSettings ? (
            <h1 className="text-sm font-medium text-[var(--color-text-primary)]">{settingsTitle}</h1>
          ) : isSubpage ? (
            <div className="flex items-center gap-1.5 text-sm">
              <button onClick={() => router.push(`/${activeValue}`)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] font-medium transition-colors">{pageTitles[activeValue] || activeValue}</button>
              <ChevronRight size={14} className="text-[var(--color-text-tertiary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">{decodeURIComponent(segments[1])}</span>
            </div>
          ) : (
            <h1 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h1>
          )}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-px h-4 bg-[var(--color-border-muted)]" />
            <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>

      <Modal
        open={contactOpen}
        onClose={handleCloseContact}
        title="Contact Us"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseContact}>Cancel</Button>
            <Button disabled={!contactMessage.trim()} onClick={handleSendContact}>Send message</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-primary)]">Subject</label>
            <Dropdown
              options={subjectOptions}
              value={contactSubject}
              onChange={(v) => setContactSubject(v as string)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-primary)]">Message</label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              rows={4}
              className="w-full rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-[border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
    </RepoProvider>
    </SettingsProvider>
  )
}
