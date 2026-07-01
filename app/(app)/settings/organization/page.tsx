'use client'
import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button, InputField, Divider } from '@/components/ui'
import { FormLayout, FormSection } from '@/components/patterns/FormLayout'
import { useToast } from '@/components/ui/ToastContext'

const ORG_ID = 'org_trustabl_2127967'
const ORG_CREATED = 'Jan 15, 2025'
const MEMBERS_COUNT = 5
const REPOS_COUNT = 12

export default function OrganizationSettingsPage() {
  const { toast } = useToast()
  const [orgName, setOrgName] = useState('Trustabl')
  const [originalOrgName, setOriginalOrgName] = useState('Trustabl')

  const handleCopyId = () => {
    navigator.clipboard.writeText(ORG_ID)
    toast('Organization ID copied')
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-6">
        <FormLayout
          title="Organization info"
          onSubmit={(e) => { e.preventDefault(); setOriginalOrgName(orgName); toast('Organization updated') }}
          footer={orgName !== originalOrgName ? (
            <>
              <Button variant="ghost" type="button" onClick={() => setOrgName(originalOrgName)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </>
          ) : undefined}
        >
          <FormSection title="General">
            <InputField label="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-primary)]">Organization ID</label>
              <div className="flex items-center gap-2 h-[42px] px-3 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] opacity-60">
                <span className="flex-1 text-sm text-[var(--color-text-primary)] font-mono">{ORG_ID}</span>
                <button type="button" onClick={handleCopyId} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </FormSection>
          <Divider />
          <div className="flex gap-6 text-xs text-[var(--color-text-tertiary)]">
            <span>Created: {ORG_CREATED}</span>
            <span>Members: {MEMBERS_COUNT}</span>
            <span>Repositories: {REPOS_COUNT}</span>
          </div>
        </FormLayout>
      </div>
    </main>
  )
}
