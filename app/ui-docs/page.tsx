'use client'
import { useState } from 'react'
import { Plus, Trash2, Search, Eye, Home, Grid, Globe, Settings, List, Zap, Upload, Pencil, GitFork, MoreHorizontal, AlertCircle } from 'lucide-react'
import {
  Button, InputField, Badge, Avatar, Spinner, ProgressBar, Divider,
  Toggle, Checkbox, Radio, Tabs, NavItem, Skeleton, Toast, Alert,
  Tooltip, Popover, Dropdown, Modal, Card, CardHeader, CardBody, CardFooter,
  Table, Pagination,
} from '@/components/ui'

function Section({ title, specs, children }: { title: string; specs: string[]; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 pb-12 border-b border-[var(--color-border-muted)]">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {specs.map(s => (
          <span key={s} className="px-2 py-0.5 text-[11px] font-medium rounded-[var(--radius-sharp)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border-muted)]">
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </section>
  )
}

interface DocTableRow { id: string; name: string; status: string; downloads: number }

export default function UIDocsPage() {
  const [tab, setTab] = useState('all')
  const [toggle1, setToggle1] = useState(true)
  const [check1, setCheck1] = useState(true)
  const [radio1, setRadio1] = useState('a')
  const [dropdown1, setDropdown1] = useState('opt1')
  const [modal1, setModal1] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const tableData: DocTableRow[] = [
    { id: '1', name: 'Widget A', status: 'Active', downloads: 100 },
    { id: '2', name: 'Widget B', status: 'Draft', downloads: 42 },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] p-6">
      <div className="max-w-[960px] mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">UI Docs</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Storybook-style component reference with spec annotations.</p>
        </div>

        <Section title="Button" specs={['sm: h-36px', 'md: h-42px', 'lg: h-46px', 'radius: --radius-base (12px)', 'gap: --space-tight (4px)']}>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="text">Text</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button icon={Plus} iconOnly aria-label="Add" />
          </div>
        </Section>

        <Section title="InputField" specs={['h-42px', 'radius: --radius-sharp (8px)', 'label: text-xs font-medium']}>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Required" required placeholder="Required field" />
            <InputField label="Optional" optional placeholder="Optional field" />
            <InputField label="Error" error="This field is invalid." defaultValue="bad" />
            <InputField label="With icon" iconLeft={Search} placeholder="Search..." />
            <InputField label="With hint" hint="Helpful hint text." />
            <InputField label="Disabled" disabled placeholder="Disabled" />
          </div>
        </Section>

        <Section title="Badge" specs={['sm: px-2 py-0.5 text-11px', 'md: px-3 py-1 text-xs', 'pill: --radius-pill', 'sharp: --radius-sharp']}>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </Section>

        <Section title="Avatar" specs={['sm: 24px', 'md: 32px', 'radius: --radius-pill']}>
          <div className="flex gap-4">
            <Avatar type="icon" size="sm" />
            <Avatar type="icon" size="md" />
            <Avatar type="initials" initials="ZA" size="md" />
          </div>
        </Section>

        <Section title="Toggle" specs={['track: w-9 h-5', 'thumb: w-3.5 h-3.5', 'role: switch']}>
          <div className="flex gap-6">
            <Toggle checked={toggle1} onChange={setToggle1} label="On" />
            <Toggle checked={false} onChange={() => {}} label="Off" disabled />
          </div>
        </Section>

        <Section title="Checkbox" specs={['w-4 h-4', 'rounded-[4px]', 'use client required']}>
          <div className="flex gap-6">
            <Checkbox checked={check1} onChange={setCheck1} label="Checked" />
            <Checkbox checked={false} onChange={() => {}} label="Unchecked" />
            <Checkbox checked={true} indeterminate onChange={() => {}} label="Indeterminate" />
          </div>
        </Section>

        <Section title="Radio" specs={['w-4 h-4', 'dot: 6px', 'border: --color-border-focus']}>
          <div className="flex gap-6">
            <Radio name="doc-radio" value="a" checked={radio1 === 'a'} onChange={setRadio1} label="Option A" />
            <Radio name="doc-radio" value="b" checked={radio1 === 'b'} onChange={setRadio1} label="Option B" />
          </div>
        </Section>

        <Section title="Dropdown" specs={['h-42px', 'radius: --radius-sharp', 'menu radius: --radius-base', 'z: --z-dropdown']}>
          <div className="max-w-[300px]">
            <Dropdown
              label="Select option"
              options={[{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }]}
              value={dropdown1}
              onChange={(v) => setDropdown1(v as string)}
            />
          </div>
        </Section>

        <Section title="Tabs" specs={['underline: h-10 border-b-2', 'pill: h-8 p-1 radius: --radius-base']}>
          <Tabs
            tabs={[
              { label: 'All', value: 'all', badge: 12 },
              { label: 'Active', value: 'active', badge: 8 },
              { label: 'Disabled', value: 'disabled', disabled: true },
            ]}
            value={tab}
            onChange={setTab}
          />
          <Tabs
            variant="pill"
            tabs={[
              { label: 'All', value: 'all', badge: 12 },
              { label: 'Active', value: 'active', badge: 8 },
            ]}
            value={tab}
            onChange={setTab}
          />
        </Section>

        <Section title="NavItem" specs={['h-9 (36px)', 'px-3 gap-2.5', 'radius: --radius-sharp']}>
          <div className="flex flex-col gap-1 max-w-[220px]">
            <NavItem label="Active" icon={Home} active onClick={() => {}} />
            <NavItem label="Default" icon={Grid} onClick={() => {}} />
            <NavItem label="Disabled" icon={Settings} disabled onClick={() => {}} />
          </div>
        </Section>

        <Section title="Card" specs={['radius: --radius-card (15px)', 'header/footer: px-4 py-3', 'body: p-4']}>
          <div className="max-w-[320px]">
            <Card>
              <CardHeader><span className="text-sm font-medium text-[var(--color-text-primary)]">Title</span></CardHeader>
              <CardBody>Card body content goes here.</CardBody>
              <CardFooter><span className="text-[11px] text-[var(--color-text-tertiary)]">Footer</span></CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Spinner" specs={['sm: 14px border-2', 'md: 20px border-2', 'radius: --radius-pill']}>
          <div className="flex gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
          </div>
        </Section>

        <Section title="ProgressBar" specs={['h-6px', 'radius: --radius-pill', 'fill: --color-text-primary']}>
          <div className="max-w-[300px]">
            <ProgressBar value={65} label="Storage" showValue />
          </div>
        </Section>

        <Section title="Divider" specs={['horizontal: h-px', 'vertical: w-px h-6', 'color: --color-border-muted']}>
          <Divider />
          <div className="flex items-center gap-4 h-6">
            <span className="text-sm text-[var(--color-text-secondary)]">Left</span>
            <Divider orientation="vertical" />
            <span className="text-sm text-[var(--color-text-secondary)]">Right</span>
          </div>
        </Section>

        <Section title="Skeleton" specs={['line: h-14px', 'circle: radius-pill', 'rect: radius-base', 'shimmer: 1.5s infinite']}>
          <div className="flex flex-col gap-3 max-w-[300px]">
            <Skeleton width="60%" />
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton variant="rect" width="100%" height={80} />
          </div>
        </Section>

        <Section title="Alert" specs={['px-4 py-3.5', 'radius: --radius-base', 'border-left: 3px', 'role: alert']}>
          <div className="flex flex-col gap-3">
            <Alert title="Info alert" description="Informational message." onDismiss={() => {}} />
            <Alert variant="success" title="Success" onDismiss={() => {}} />
            <Alert variant="warning" title="Warning" onDismiss={() => {}} />
            <Alert variant="danger" title="Danger" onDismiss={() => {}} />
          </div>
        </Section>

        <Section title="Toast" specs={['px-4 py-3.5', 'radius: --radius-base', 'max-w: 360px', 'auto-dismiss: 4000ms']}>
          <Toast message="Action completed." onDismiss={() => {}} duration={0} />
        </Section>

        <Section title="Tooltip" specs={['px-2.5 py-1.5', 'radius: --radius-sharp', 'bg: --color-text-primary', 'arrow: 6px']}>
          <div className="pt-10">
            <Tooltip content="Tooltip text" position="top">
              <Button variant="secondary" size="sm">Hover me</Button>
            </Tooltip>
          </div>
        </Section>

        <Section title="Popover" specs={['min-w: 180px', 'radius: --radius-base', 'shadow: --shadow-float', 'z: --z-dropdown']}>
          <Popover
            type="menu"
            trigger={<Button icon={MoreHorizontal} iconOnly variant="ghost" aria-label="Menu" />}
            items={[
              { label: 'Edit', icon: Pencil, onClick: () => {} },
              { label: 'Delete', icon: Trash2, onClick: () => {}, danger: true },
            ]}
          />
        </Section>

        <Section title="Modal" specs={['max-w: 440px', 'radius: --radius-card', 'header: px-5 py-18px', 'z: --z-modal']}>
          <Button onClick={() => setModal1(true)}>Open Modal</Button>
          <Modal open={modal1} onClose={() => setModal1(false)} title="Example Modal" footer={<Button onClick={() => setModal1(false)}>Close</Button>}>
            Modal body content.
          </Modal>
        </Section>

        <Section title="Table" specs={['radius: --radius-base', 'header: text-11px uppercase', 'cell: px-4 py-3 text-sm']}>
          <Table
            columns={[
              { key: 'name', label: 'Name', sortable: true },
              { key: 'status', label: 'Status', render: (v) => <Badge variant="info" size="sm">{String(v)}</Badge> },
              { key: 'downloads', label: 'Downloads', sortable: true },
            ]}
            data={tableData}
            selectable
            selectedRows={selectedRows}
            onSelect={setSelectedRows}
          />
        </Section>

        <Section title="Pagination" specs={['btn: w-8 h-8', 'radius: --radius-sharp', 'inline: radius --radius-base']}>
          <Pagination
            currentPage={page}
            totalPages={5}
            totalItems={50}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </Section>

      </div>
    </div>
  )
}
