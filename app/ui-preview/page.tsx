'use client'
import { useEffect, useState } from 'react'
import { Home, Grid, Globe, Settings, Plus, Trash2, Search, Eye, List, Zap, Upload, LayoutGrid, AlignJustify, Filter, MoreHorizontal, Pencil, GitFork, Star, MessageSquare, Download, AlertCircle, Monitor } from 'lucide-react'
import {
  Button, InputField, Badge, Avatar, Spinner, ProgressBar, Divider,
  Toggle, Checkbox, Radio, Tabs, NavItem, Skeleton, Toast, Alert,
  Tooltip, Popover, Dropdown, Modal, FileUpload, Table, Pagination,
  Card, CardHeader, CardBody, CardFooter,
} from '@/components/ui'
import { Sidebar } from '@/components/patterns/Sidebar'
import { Toolbar } from '@/components/patterns/Toolbar'
import { FormLayout, FormSection } from '@/components/patterns/FormLayout'
import { EmptyState } from '@/components/patterns/EmptyState'

const navItems = [
  { label: 'Home', value: 'home', icon: Home },
  { label: 'Catalog', value: 'catalog', icon: Grid },
  { label: 'Community', value: 'community', icon: Globe },
  { label: 'Settings', value: 'settings', icon: Settings },
]

interface TableRow {
  id: string
  name: string
  status: string
  downloads: number
}

const tableData: TableRow[] = [
  { id: '1', name: 'api-gateway', status: 'Published', downloads: 1243 },
  { id: '2', name: 'auth-module', status: 'Draft', downloads: 87 },
  { id: '3', name: 'payment-bridge', status: 'Published', downloads: 4521 },
  { id: '4', name: 'notification-hub', status: 'Error', downloads: 312 },
]

export default function UIPreviewPage() {
  const [toggleOn, setToggleOn] = useState(true)
  const [toggleOff, setToggleOff] = useState(false)
  const [checkAll, setCheckAll] = useState(true)
  const [checkNone, setCheckNone] = useState(false)
  const [radioVal, setRadioVal] = useState('langflow')
  const [activeTab, setActiveTab] = useState('all')
  const [pillTab, setPillTab] = useState('all')
  const [dropdownVal, setDropdownVal] = useState('n8n')
  const [selectedRows, setSelectedRows] = useState<string[]>(['1'])
  const [sortKey, setSortKey] = useState<keyof TableRow>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalDefault, setModalDefault] = useState(false)
  const [modalWarning, setModalWarning] = useState(false)
  const [modalDanger, setModalDanger] = useState(false)
  const [username] = useState('')
  const [bio] = useState('')

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  const handleSort = (key: keyof TableRow) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = [...tableData].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1
    return String(a[sortKey]).localeCompare(String(b[sortKey])) * mult
  })

  const noop = () => {}

  return (
    <div className="flex h-screen w-screen bg-[var(--color-bg-page)] overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0 overflow-hidden">
        <Sidebar
          items={navItems}
          activeValue="home"
          onNavigate={noop}
          onNewComponent={noop}
          username="zanexflores"
          email="zanexflores@gmail.com"
          onProfileClick={noop}
        />
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] px-6 py-4" style={{ zIndex: 'var(--z-overlay)' }}>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">CF Design System</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">v0.4.1 — UI Preview</p>
          </div>
          <Badge variant="success">All components</Badge>
        </div>

        {/* Content — only this scrolls */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 flex flex-col gap-12 pb-24">

          {/* Buttons */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Button</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="text">Text</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small 36px</Button>
                <Button size="md">Medium 42px</Button>
                <Button size="lg">Large 46px</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button icon={Plus} iconOnly aria-label="Add" />
                <Button icon={Trash2} iconOnly variant="danger" aria-label="Delete" />
              </div>
            </div>
          </section>

          {/* NavItem */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">NavItem</h2>
            <div className="flex flex-col gap-1 max-w-[220px]">
              <NavItem label="Active" icon={Home} active onClick={noop} />
              <NavItem label="Default" icon={Grid} onClick={noop} />
              <NavItem label="Hover me" icon={Globe} onClick={noop} />
              <NavItem label="Disabled" icon={Settings} disabled onClick={noop} />
            </div>
          </section>

          {/* InputField */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">InputField</h2>
            <div className="grid grid-cols-2 gap-4 max-w-[640px]">
              <InputField label="API Key" placeholder="sk-ant-api03-••••" required />
              <InputField label="Bio" optional placeholder="Tell us about yourself" />
              <InputField label="Email" type="email" defaultValue="zane@#!" error="Enter a valid email address." required />
              <InputField label="Search" iconLeft={Search} placeholder="Search components..." />
              <InputField label="Password" type="password" hint="Use at least 8 characters with a number." required />
            </div>
          </section>

          {/* Dropdown */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Dropdown</h2>
            <div className="max-w-[300px]">
              <Dropdown
                label="Platform"
                options={[
                  { label: 'n8n', value: 'n8n' },
                  { label: 'Langflow', value: 'langflow' },
                  { label: 'Autogen', value: 'autogen' },
                ]}
                value={dropdownVal}
                onChange={(v) => setDropdownVal(v as string)}
              />
            </div>
          </section>

          {/* Card */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Card</h2>
            <div className="grid grid-cols-2 gap-6 max-w-[640px]">
              <Card>
                <CardHeader>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">API Gateway</span>
                  <Badge variant="info">Active</Badge>
                </CardHeader>
                <CardBody>Routes requests to the appropriate agent component.</CardBody>
                <CardFooter>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">2h ago</span>
                  <Button variant="ghost" size="sm">View</Button>
                </CardFooter>
              </Card>
              <Card variant="interactive" onClick={noop}>
                <CardHeader>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Auth Module</span>
                  <Badge variant="warning">Draft</Badge>
                </CardHeader>
                <CardBody>Handles user authentication and session management.</CardBody>
                <CardFooter>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">5m ago</span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Badge */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Badge</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" shape="sharp" size="sm">Info</Badge>
                <Badge variant="success" shape="sharp" size="sm">Success</Badge>
                <Badge variant="warning" shape="sharp" size="sm">Warning</Badge>
                <Badge variant="danger" shape="sharp" size="sm">Danger</Badge>
                <Badge variant="neutral" shape="sharp" size="sm">Neutral</Badge>
              </div>
            </div>
          </section>

          {/* Form Controls */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Form Controls</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-6">
                <Toggle checked={toggleOn} onChange={setToggleOn} label="On" />
                <Toggle checked={toggleOff} onChange={setToggleOff} label="Off" />
                <Toggle checked={false} onChange={noop} label="Disabled" disabled />
              </div>
              <div className="flex items-center gap-6">
                <Checkbox checked={checkAll} onChange={setCheckAll} label="Checked" />
                <Checkbox checked={checkNone} onChange={setCheckNone} label="Unchecked" />
                <Checkbox checked={true} indeterminate onChange={noop} label="Indeterminate" />
                <Checkbox checked={false} onChange={noop} label="Disabled" disabled />
              </div>
              <div className="flex items-center gap-6">
                <Radio name="platform" value="langflow" checked={radioVal === 'langflow'} onChange={setRadioVal} label="Langflow" />
                <Radio name="platform" value="autogen" checked={radioVal === 'autogen'} onChange={setRadioVal} label="Autogen" />
                <Radio name="platform-dis" value="disabled" checked={false} onChange={noop} label="Disabled" disabled />
              </div>
            </div>
          </section>

          {/* Tabs */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Tabs</h2>
            <div className="flex flex-col gap-6">
              <Tabs
                tabs={[
                  { label: 'All', value: 'all', icon: List, badge: 374 },
                  { label: 'Generated', value: 'generated', icon: Zap, badge: 138 },
                  { label: 'Published', value: 'published', icon: Upload, badge: 201 },
                  { label: 'Trash', value: 'trash', icon: Trash2, badge: 7, disabled: true },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
              <Tabs
                variant="pill"
                tabs={[
                  { label: 'All', value: 'all', icon: List, badge: 374 },
                  { label: 'Generated', value: 'generated', icon: Zap, badge: 138 },
                  { label: 'Published', value: 'published', icon: Upload, badge: 201 },
                ]}
                value={pillTab}
                onChange={setPillTab}
              />
            </div>
          </section>

          {/* Toolbar */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Toolbar</h2>
            <Toolbar
              tabs={[
                { label: 'All', value: 'all', icon: List, badge: 374 },
                { label: 'Generated', value: 'generated', icon: Zap, badge: 138 },
              ]}
              activeTab="all"
              onTabChange={noop}
              actions={[
                { icon: LayoutGrid, onClick: noop, active: true, 'aria-label': 'Grid view' },
                { icon: AlignJustify, onClick: noop, 'aria-label': 'List view' },
                { icon: Filter, onClick: noop, 'aria-label': 'Open filters' },
              ]}
            />
          </section>

          {/* Avatar + Spinner + Progress + Divider */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Avatar · Spinner · Progress · Divider</h2>
            <div className="flex items-center gap-6">
              <Avatar type="icon" />
              <Avatar type="initials" initials="ZA" />
              <Avatar type="icon" size="sm" />
              <Divider orientation="vertical" />
              <Spinner />
              <Spinner size="sm" />
              <Divider orientation="vertical" />
              <div className="w-48">
                <ProgressBar value={65} label="Storage" showValue />
              </div>
            </div>
            <div className="mt-4">
              <Divider />
            </div>
          </section>

          {/* Skeleton */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Skeleton</h2>
            <div className="flex flex-col gap-4 max-w-[400px]">
              <Skeleton width="60%" height={14} />
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={32} height={32} />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton width="40%" height={12} />
                  <Skeleton width="80%" height={12} />
                </div>
              </div>
              <Skeleton variant="rect" width="100%" height={120} />
            </div>
          </section>

          {/* Alert */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Alert</h2>
            <div className="flex flex-col gap-3 max-w-[640px]">
              <Alert title="API quota almost full" description="You've used 80% of your free tier." onDismiss={noop} />
              <Alert variant="success" title="Component published" description="Now visible in the community catalog." onDismiss={noop} />
              <Alert variant="warning" title="Breaking change detected" description="This update may affect existing workflows." onDismiss={noop} />
              <Alert variant="danger" title="API key invalid" description="Generate a new key to continue." onDismiss={noop} />
            </div>
          </section>

          {/* Tooltip */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Tooltip</h2>
            <div className="flex items-center gap-6 pt-10">
              <Tooltip content="Delete this component" position="top">
                <Button icon={Trash2} iconOnly variant="danger" aria-label="Delete" />
              </Tooltip>
              <Tooltip content="Edit component" position="bottom">
                <Button icon={Pencil} iconOnly variant="secondary" aria-label="Edit" />
              </Tooltip>
            </div>
          </section>

          {/* Popover + Toast */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Popover · Toast</h2>
            <div className="flex items-center gap-6">
              <Popover
                type="menu"
                trigger={<Button icon={MoreHorizontal} iconOnly variant="ghost" aria-label="More options" />}
                items={[
                  { label: 'Edit', icon: Pencil, onClick: noop },
                  { label: 'Fork', icon: GitFork, onClick: noop },
                  { label: 'Delete', icon: Trash2, onClick: noop, danger: true },
                ]}
              />
              <Toast message="Component published successfully." onDismiss={noop} duration={0} />
            </div>
          </section>

          {/* FileUpload */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">FileUpload</h2>
            <div className="max-w-[480px]">
              <FileUpload accept=".pdf,.png,.jpg" maxSize={10 * 1024 * 1024} multiple />
            </div>
          </section>

          {/* Table */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Table</h2>
            <Table
              columns={[
                { key: 'name', label: 'Component', sortable: true },
                { key: 'status', label: 'Status', render: (v) => {
                  const variant = v === 'Published' ? 'success' : v === 'Error' ? 'danger' : 'warning'
                  return <Badge variant={variant} size="sm">{String(v)}</Badge>
                }},
                { key: 'downloads', label: 'Downloads', sortable: true },
              ]}
              data={sortedData}
              selectable
              selectedRows={selectedRows}
              onSelect={setSelectedRows}
              sortKey={sortKey}
              sortDirection={sortDir}
              onSort={handleSort}
            />
          </section>

          {/* Pagination inline */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Pagination</h2>
            <Pagination
              currentPage={page}
              totalPages={12}
              totalItems={374}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </section>

          {/* Modal */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Modal</h2>
            <div className="flex items-center gap-3">
              <Button onClick={() => setModalDefault(true)}>Default Modal</Button>
              <Button variant="secondary" onClick={() => setModalWarning(true)}>Warning Modal</Button>
              <Button variant="danger" onClick={() => setModalDanger(true)}>Danger Modal</Button>
            </div>
            <Modal
              open={modalDefault}
              onClose={() => setModalDefault(false)}
              title="Add API Key"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModalDefault(false)}>Cancel</Button>
                  <Button onClick={() => setModalDefault(false)}>Save Key</Button>
                </>
              }
            >
              <InputField label="API Key" placeholder="sk-ant-api03-••••" required />
            </Modal>
            <Modal
              open={modalWarning}
              onClose={() => setModalWarning(false)}
              title="Unsaved Changes"
              variant="warning"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModalWarning(false)}>Discard</Button>
                  <Button onClick={() => setModalWarning(false)}>Save Changes</Button>
                </>
              }
            >
              You have unsaved changes. Do you want to save before leaving?
            </Modal>
            <Modal
              open={modalDanger}
              onClose={() => setModalDanger(false)}
              title="Delete Component"
              variant="danger"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModalDanger(false)}>Cancel</Button>
                  <Button variant="danger" onClick={() => setModalDanger(false)}>Delete</Button>
                </>
              }
            >
              This action cannot be undone. This will permanently delete the component and all associated data.
            </Modal>
          </section>

          {/* Form Layout */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Form Layout</h2>
            <FormLayout
              title="Edit Profile"
              onSubmit={(e) => e.preventDefault()}
              footer={
                <>
                  <Button variant="ghost" type="button">Discard</Button>
                  <Button type="submit">Save Changes</Button>
                </>
              }
            >
              <FormSection title="General">
                <InputField label="Username" required defaultValue={username} />
                <InputField label="Bio" optional placeholder="Tell us about yourself" defaultValue={bio} />
              </FormSection>
              <FormSection title="Preferences">
                <Toggle checked={toggleOn} onChange={setToggleOn} label="Email notifications" />
              </FormSection>
            </FormLayout>
          </section>

          {/* Empty State */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Empty State</h2>
            <div className="grid grid-cols-3 gap-6">
              <EmptyState
                icon={Grid}
                title="No components yet"
                description="Create your first component to get started with the catalog."
                action={{ label: 'New Component', onClick: noop }}
              />
              <EmptyState
                icon={Search}
                title="No results found"
                description="No components match your filters. Try adjusting or clearing them."
                action={{ label: 'Clear filters', onClick: noop, variant: 'ghost' }}
              />
              <EmptyState
                icon={AlertCircle}
                title="Failed to load"
                description="Something went wrong. Please try again."
                action={{ label: 'Retry', onClick: noop, variant: 'ghost' }}
                danger
              />
            </div>
          </section>

        </main>
      </div>

      {/* Sticky Pagination */}
      <Pagination
        variant="sticky"
        stickyLeftOffset={220}
        currentPage={page}
        totalPages={12}
        totalItems={374}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}
