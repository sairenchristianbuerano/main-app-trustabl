'use client'
import { useState } from 'react'
import { Search, UserPlus, Link2, Copy, Trash2, MoreVertical, RotateCw, Users } from 'lucide-react'
import { Badge, Table, InputField, Button, Modal, Dropdown, Popover } from '@/components/ui'
import { EmptyState } from '@/components/patterns/EmptyState'
import { useToast } from '@/components/ui/ToastContext'
import { useNotifications } from '@/components/ui/NotificationContext'

interface MemberRow {
  id: string
  name: string
  email: string
  role: string
  status: string
  joined: string
  joinedDate: string
  lastOnline: string
}

const roleOptions = ['Editor', 'Member', 'Viewer']

const initialMembers: MemberRow[] = [
  { id: '2', name: 'alice', email: 'alice@example.com', role: 'Editor', status: 'Invited', joined: '', joinedDate: '9999-12-31', lastOnline: '' },
  { id: '3', name: 'bob', email: 'bob@example.com', role: 'Viewer', status: 'Invited', joined: '', joinedDate: '9999-12-30', lastOnline: '' },
  { id: '4', name: 'charlie', email: 'charlie@example.com', role: 'Editor', status: 'Active', joined: 'May 20, 2025', joinedDate: '2025-05-20', lastOnline: 'Online now' },
  { id: '5', name: 'diana', email: 'diana@example.com', role: 'Viewer', status: 'Active', joined: 'Apr 10, 2025', joinedDate: '2025-04-10', lastOnline: '3 days ago' },
  { id: '1', name: 'controlcane', email: 'zanexflores@gmail.com', role: 'Owner', status: 'Active', joined: 'Jan 15, 2025', joinedDate: '2025-01-15', lastOnline: 'Online now' },
]

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export function MembersSection() {
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [data, setData] = useState(initialMembers)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<keyof MemberRow>('joined')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Member')
  const [linkRole, setLinkRole] = useState('Member')
  const [linkId, setLinkId] = useState('')
  const [copied, setCopied] = useState(false)

  const inviteLink = linkId ? `https://app.trustabl.com/invite/${linkId}?role=${linkRole.toLowerCase()}` : null

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRevokeLink = () => {
    setLinkId('')
    setCopied(false)
  }

  const handleOpenLinkModal = () => {
    setLinkRole('Member')
    setLinkId(generateId())
    setCopied(false)
    setLinkModalOpen(true)
  }

  const handleCloseInviteModal = () => {
    setInviteModalOpen(false)
    setInviteEmail('')
    setInviteRole('Member')
  }

  const isDuplicate = (email: string) => data.some(m => m.email.toLowerCase() === email.toLowerCase())
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSendInvite = () => {
    const email = inviteEmail
    if (!isValidEmail(email) || isDuplicate(email)) return
    const name = email.split('@')[0]
    const id = generateId()
    setData(prev => [...prev, { id, name, email, role: inviteRole, status: 'Invited', joined: '', joinedDate: '9999-12-31', lastOnline: '' }])
    handleCloseInviteModal()
    toast(`Invite sent to ${email}`)
    setTimeout(() => {
      setData(prev => prev.map(m => m.id === id ? { ...m, status: 'Active', joined: 'Just now', joinedDate: new Date().toISOString().slice(0, 10), lastOnline: 'Online now' } : m))
      addNotification({
        type: 'team_invite_accepted',
        content: `${name} joined the organization`,
        link: { page: 'members' },
        batch_id: null,
        batch_summary: null,
      })
    }, 5000)
  }

  const handleResendInvite = (row: MemberRow) => {
    toast(`Invite resent to ${row.email}`)
  }

  const handleChangeRole = (row: MemberRow, role: string) => {
    setData(prev => prev.map(m => m.id === row.id ? { ...m, role } : m))
    toast(`${row.email} is now ${role}`)
  }

  const handleRemoveMember = () => {
    if (!removeTarget) return
    const email = removeTarget.email
    setData(prev => prev.filter(m => m.id !== removeTarget.id))
    setRemoveTarget(null)
    toast(`${email} has been removed`)
  }

  const handleCloseLinkModal = () => {
    setLinkModalOpen(false)
    setLinkId('')
    setLinkRole('Member')
    setCopied(false)
  }

  const handleSort = (key: keyof MemberRow) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = data.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const sortedData = [...filtered].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1
    const key = sortKey === 'joined' ? 'joinedDate' : sortKey
    return String(a[key]).localeCompare(String(b[key])) * mult
  })

  return (
    <>
      <div className="w-full max-w-[1120px] flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="w-[260px]">
            <InputField
              label=""
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={Search}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Link2} onClick={handleOpenLinkModal}>Invite via link</Button>
            <Button icon={UserPlus} onClick={() => setInviteModalOpen(true)}>Invite Member</Button>
          </div>
        </div>
        {data.length <= 1 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite your team to collaborate"
            action={{ label: 'Invite Member', onClick: () => setInviteModalOpen(true) }}
          />
        ) : (
        <Table
          columns={[
            { key: 'email', label: 'Email', sortable: true, width: 'w-[26%]' },
            { key: 'role', label: 'Permission', width: 'w-[13%]', render: (v) => (
              <span className="text-[var(--color-text-secondary)]">{String(v)}</span>
            )},
            { key: 'status', label: 'Status', sortable: true, width: 'w-[12%]', render: (v) => {
              const variant = v === 'Active' ? 'success' : 'neutral'
              return <Badge variant={variant} size="sm">{String(v)}</Badge>
            }},
            { key: 'joined', label: 'Joined', sortable: true, width: 'w-[15%]', render: (v) => (
              <span className="text-[var(--color-text-secondary)]">{String(v) || '—'}</span>
            )},
            { key: 'lastOnline', label: 'Last Online', sortable: true, width: 'w-[15%]', render: (v) => {
              const val = String(v)
              if (val === 'Online now') {
                return (
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-text-primary)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success-text)] flex-shrink-0" />
                    Online now
                  </span>
                )
              }
              return <span className="text-[var(--color-text-secondary)]">{val || '—'}</span>
            }},
            { key: 'id', label: 'Actions', width: 'w-[10%]', align: 'center' as const, render: (_v, row) => (
              row.role === 'Owner' ? null : (
                <Popover
                  position="left"
                  type="menu"
                  trigger={
                    <button
                      aria-label="Member actions"
                      className="p-1.5 rounded-[var(--radius-sharp)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
                    >
                      <MoreVertical size={14} />
                    </button>
                  }
                  items={[
                    ...roleOptions.filter(r => r !== row.role).map(r => ({
                      label: `Make ${r}`,
                      onClick: () => handleChangeRole(row, r),
                    })),
                    ...(row.status === 'Invited' ? [{ label: 'Resend invite', icon: RotateCw, onClick: () => handleResendInvite(row) }] : []),
                    { label: 'Remove member', icon: Trash2, danger: true, onClick: () => setRemoveTarget(row) },
                  ]}
                />
              )
            )},
          ]}
          data={sortedData}
          sortKey={sortKey}
          sortDirection={sortDir}
          onSort={handleSort}
        />
        )}
      </div>

      <Modal
        open={linkModalOpen}
        onClose={handleCloseLinkModal}
        title="Invite via link"
        footer={
          <>
            <Button variant="ghost" icon={Trash2} onClick={handleRevokeLink}>Revoke link</Button>
            <Button onClick={handleCloseLinkModal}>Done</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Share this link to invite someone to your organization.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-primary)]">Role</label>
            <Dropdown
              options={roleOptions.map(r => ({ label: r, value: r }))}
              value={linkRole}
              onChange={(v) => { setLinkRole(v as string); setCopied(false) }}
            />
          </div>
          {inviteLink && (
            <div className="flex items-center gap-2 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-page)] px-3 py-2.5">
              <Link2 size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate font-mono">{inviteLink}</span>
              <div className="w-px h-5 bg-[var(--color-border-muted)] flex-shrink-0" />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex-shrink-0"
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={inviteModalOpen}
        onClose={handleCloseInviteModal}
        title="Invite member"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseInviteModal}>Cancel</Button>
            <Button disabled={!isValidEmail(inviteEmail) || isDuplicate(inviteEmail)} onClick={handleSendInvite}>Send invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            They will receive an email with a link to join.
          </p>
          <InputField
            label="Email address"
            type="email"
            placeholder="name@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            error={inviteEmail && isDuplicate(inviteEmail) ? 'This person is already a member or has a pending invite' : undefined}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-primary)]">Role</label>
            <Dropdown
              options={roleOptions.map(r => ({ label: r, value: r }))}
              value={inviteRole}
              onChange={(v) => setInviteRole(v as string)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRemoveMember}>Remove member</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          This will remove <strong className="text-[var(--color-text-primary)]">{removeTarget?.email}</strong> from the organization.
        </p>
      </Modal>
    </>
  )
}
