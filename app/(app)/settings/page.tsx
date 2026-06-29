'use client'
import { useState, useEffect } from 'react'
import { Copy, Download, Key, Trash2 } from 'lucide-react'
import { Button, InputField, Divider, Badge, Avatar, Tabs, Table, Dropdown } from '@/components/ui'
import { FormLayout, FormSection } from '@/components/patterns/FormLayout'
import { useToast } from '@/components/ui/ToastContext'

const settingsTabs = [
  { label: 'Account', value: 'account' },
  { label: 'Billing', value: 'billing' },
  { label: 'Project', value: 'project' },
  { label: 'LLM', value: 'llm' },
]

const llmProviders = [
  { label: 'Anthropic (Claude)', value: 'anthropic' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Google (Gemini)', value: 'google' },
]

const invoices = [
  { id: '1', date: 'Jun 1, 2026', amount: '$49.00', status: 'Paid' },
  { id: '2', date: 'May 1, 2026', amount: '$49.00', status: 'Paid' },
  { id: '3', date: 'Apr 1, 2026', amount: '$49.00', status: 'Paid' },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('account')
  const [name, setName] = useState('Zane Flores')
  const [originalName] = useState('Zane Flores')
  const [projectName, setProjectName] = useState('project-zane2127967')
  const [originalProjectName] = useState('project-zane2127967')
  const projectId = 'proj_zane2127967'

  const [llmProvider, setLlmProvider] = useState('')
  const [llmApiKey, setLlmApiKey] = useState('')
  const [llmSaved, setLlmSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('llm_config')
    if (saved) {
      const config = JSON.parse(saved)
      setLlmProvider(config.provider || '')
      setLlmApiKey(config.api_key || '')
      setLlmSaved(true)
    }
  }, [])

  const handleSaveLLM = () => {
    localStorage.setItem('llm_config', JSON.stringify({ provider: llmProvider, api_key: llmApiKey }))
    setLlmSaved(true)
    toast('LLM configuration saved')
  }

  const handleRemoveLLM = () => {
    localStorage.removeItem('llm_config')
    setLlmProvider('')
    setLlmApiKey('')
    setLlmSaved(false)
    toast('LLM configuration removed')
  }

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(projectId)
    toast('Project ID copied')
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-6">
        <Tabs tabs={settingsTabs} value={tab} onChange={setTab} />

        {tab === 'account' && (
          <FormLayout
            title="Profile"
            onSubmit={(e) => { e.preventDefault(); toast('Changes saved') }}
            footer={
              <>
                <Button variant="ghost" type="button" onClick={() => setName(originalName)}>Cancel</Button>
                <Button type="submit" disabled={name === originalName}>Save changes</Button>
              </>
            }
          >
            <div className="flex items-center gap-4">
              <Avatar type="initials" initials="ZF" size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">Member since January 2025</p>
              </div>
              <Button variant="ghost" size="sm">Change avatar</Button>
            </div>
            <Divider />
            <FormSection title="General">
              <InputField label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <InputField label="Email" type="email" defaultValue="zanexflores@gmail.com" disabled hint="Managed by your GitHub account" />
            </FormSection>
          </FormLayout>
        )}

        {tab === 'billing' && (
          <>
            <FormLayout
              title="Current Plan"
              onSubmit={(e) => e.preventDefault()}
              footer={
                <>
                  <Button variant="secondary">Upgrade to Enterprise</Button>
                  <Button>Change plan</Button>
                </>
              }
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Team</p>
                    <Badge variant="info" size="sm">Active</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">$49/month &middot; Renews on June 10, 2026</p>
                </div>
              </div>
            </FormLayout>

            <FormLayout
              title="Payment Method"
              onSubmit={(e) => e.preventDefault()}
              footer={
                <Button variant="secondary">Update payment method</Button>
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded-[var(--radius-sharp)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-tertiary)]">VISA</div>
                <div>
                  <p className="text-sm text-[var(--color-text-primary)]">Visa ending in 4242</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Expires 12/2028</p>
                </div>
              </div>
            </FormLayout>

            <FormLayout
              title="Invoice History"
              onSubmit={(e) => e.preventDefault()}
              footer={<div />}
            >
              <Table
                columns={[
                  { key: 'date', label: 'Date', width: 'w-[35%]' },
                  { key: 'amount', label: 'Amount', width: 'w-[25%]' },
                  { key: 'status', label: 'Status', width: 'w-[20%]', render: (v) => (
                    <Badge variant="success" size="sm">{String(v)}</Badge>
                  )},
                  { key: 'id', label: '', width: 'w-[20%]', align: 'right' as const, render: () => (
                    <button className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] flex items-center gap-1">
                      <Download size={12} /> PDF
                    </button>
                  )},
                ]}
                data={invoices}
              />
            </FormLayout>
          </>
        )}

        {tab === 'project' && (
          <>
            <FormLayout
              title="Project Details"
              onSubmit={(e) => { e.preventDefault(); toast('Project updated') }}
              footer={
                <>
                  <Button variant="ghost" type="button" onClick={() => setProjectName(originalProjectName)}>Cancel</Button>
                  <Button type="submit" disabled={projectName === originalProjectName}>Save changes</Button>
                </>
              }
            >
              <FormSection title="General">
                <InputField label="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--color-text-primary)]">Project ID</label>
                  <div className="flex items-center gap-2 h-[42px] px-3 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] opacity-60">
                    <span className="flex-1 text-sm text-[var(--color-text-primary)] font-mono">{projectId}</span>
                    <button type="button" onClick={handleCopyProjectId} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </FormSection>
              <Divider />
              <div className="flex gap-6 text-xs text-[var(--color-text-tertiary)]">
                <span>Created: Jan 15, 2025</span>
                <span>Members: 5</span>
              </div>
            </FormLayout>

            <FormLayout
              title="Data"
              onSubmit={(e) => e.preventDefault()}
              footer={<div />}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Export project data</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Download all project data as a ZIP archive</p>
                </div>
                <Button variant="secondary" size="sm" icon={Download}>Export</Button>
              </div>
            </FormLayout>
          </>
        )}

        {tab === 'llm' && (
          <>
            <FormLayout
              title="LLM Provider"
              onSubmit={(e) => { e.preventDefault(); handleSaveLLM() }}
              footer={
                llmSaved ? (
                  <>
                    <Button variant="danger" size="sm" type="button" icon={Trash2} onClick={handleRemoveLLM}>Remove key</Button>
                    <Button type="submit" disabled={!llmProvider || !llmApiKey}>Update</Button>
                  </>
                ) : (
                  <Button type="submit" disabled={!llmProvider || !llmApiKey} icon={Key}>Save API key</Button>
                )
              }
            >
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-[var(--color-text-primary)]">
                  Enrichment uses an LLM to generate detailed explanations and code fixes for static analysis findings. Bring your own API key — your key, your usage, your cost.
                </p>
              </div>
              <Divider />
              <FormSection title="Configuration">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--color-text-primary)]">Provider</label>
                  <Dropdown
                    options={llmProviders}
                    value={llmProvider}
                    onChange={(v) => setLlmProvider(v as string)}
                    placeholder="Select provider"
                  />
                </div>
                <InputField
                  label="API Key"
                  type="password"
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder={llmProvider === 'anthropic' ? 'sk-ant-...' : llmProvider === 'openai' ? 'sk-...' : 'Enter API key'}
                  hint="Your key is stored locally and never sent to our servers"
                />
              </FormSection>
              {llmSaved && (
                <>
                  <Divider />
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">Connected</Badge>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {llmProviders.find(p => p.value === llmProvider)?.label ?? llmProvider} configured
                    </span>
                  </div>
                </>
              )}
            </FormLayout>
          </>
        )}
      </div>
    </main>
  )
}
