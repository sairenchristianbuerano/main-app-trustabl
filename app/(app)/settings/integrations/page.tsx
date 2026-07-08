'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { Button, InputField, Toggle, Dropdown, Modal, Badge } from '@/components/ui'
import { FormLayout } from '@/components/patterns/FormLayout'
import { useToast } from '@/components/ui/ToastContext'
import { useSettings } from '@/app/(app)/settings/SettingsContext'

type ToggleId = 'enrichment' | 'autofix'
type ModalTrigger = ToggleId | 'manual'

const llmProviders = [
  { label: 'Claude', value: 'claude' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Custom', value: 'custom' },
]

const toggleLabel: Record<ToggleId, string> = {
  enrichment: 'Enrichment',
  autofix: 'Autofix',
}

function maskKey(key: string) {
  if (key.length <= 4) return '*'.repeat(key.length)
  return `sk-${'*'.repeat(15)}${key.slice(-4)}`
}

export default function IntegrationsSettingsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [highlightSection, setHighlightSection] = useState<string | null>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const h = searchParams.get('highlight')
    if (!h) return
    setHighlightSection(h)
    const el = document.getElementById(`${h}-section`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    highlightTimerRef.current = setTimeout(() => setHighlightSection(null), 2500)
    return () => { if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current) }
  }, [searchParams])

  const {
    enrichmentEnabled, autofixEnabled, llmProvider: savedProvider, llmApiKey: savedApiKey,
    setEnrichmentEnabled, setAutofixEnabled, setLlmConfig, clearLlmConfig,
  } = useSettings()
  const llmSaved = !!savedApiKey

  const [modalFor, setModalFor] = useState<ModalTrigger | null>(null)
  const [formProvider, setFormProvider] = useState('')
  const [formApiKey, setFormApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')

  const [hasInteracted, setHasInteracted] = useState(false)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)

  const setEnabled = (which: ToggleId, value: boolean) => {
    if (which === 'enrichment') setEnrichmentEnabled(value)
    else setAutofixEnabled(value)
  }

  const isEnabled = (which: ToggleId) => which === 'enrichment' ? enrichmentEnabled : autofixEnabled

  const handleToggleClick = (which: ToggleId) => {
    if (modalFor) return // ignore clicks while a config modal is already open

    if (isEnabled(which)) {
      setEnabled(which, false)
      return
    }
    if (llmSaved) {
      setEnabled(which, true)
      return
    }
    setHasInteracted(true)
    setModalFor(which)
    setFormProvider('')
    setFormApiKey('')
    setSaveState('idle')
  }

  const handleConfigureLLM = () => {
    if (modalFor) return
    setHasInteracted(true)
    setModalFor('manual')
    setFormProvider('')
    setFormApiKey('')
    setSaveState('idle')
  }

  const handleChangeProvider = () => {
    setModalFor('manual')
    setFormProvider(savedProvider)
    setFormApiKey('')
    setSaveState('idle')
  }

  const handleCloseModal = () => {
    setModalFor(null)
    setFormProvider('')
    setFormApiKey('')
    setSaveState('idle')
  }

  const handleSaveLLM = () => {
    setSaveState('saving')
    setTimeout(() => {
      if (formApiKey.length >= 8) {
        setLlmConfig(formProvider, formApiKey)
        if (modalFor && modalFor !== 'manual') setEnabled(modalFor, true)
        handleCloseModal()
        toast('LLM provider connected')
      } else {
        setSaveState('error')
      }
    }, 900)
  }

  const handleRemoveLLM = () => {
    clearLlmConfig()
    setRemoveConfirmOpen(false)
    toast('LLM provider removed. Enrichment and Autofix have been disabled.')
  }

  const renderReadyBadge = (which: ToggleId) => {
    if (!llmSaved || isEnabled(which)) return null
    return (
      <Badge variant="success" size="sm">
        <span className="flex items-center gap-1">
          <Zap size={11} />
          LLM ready
        </span>
      </Badge>
    )
  }

  const llmSectionVisible = llmSaved || hasInteracted || highlightSection === 'llm'

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-6">
        <div
          id="enrichment-section"
          className="rounded-[var(--radius-card)] transition-[box-shadow] duration-300"
          style={{ boxShadow: highlightSection === 'enrichment' ? '0 0 0 2px var(--color-accent-default)' : 'none' }}
        >
        <FormLayout title="Enrichment" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between">
            <div className="max-w-[420px]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Enrichment</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                Use AI to generate detailed explanations and code fixes for findings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderReadyBadge('enrichment')}
              <Toggle checked={enrichmentEnabled} onChange={() => handleToggleClick('enrichment')} />
            </div>
          </div>
        </FormLayout>
        </div>

        <div
          id="autofix-section"
          className="rounded-[var(--radius-card)] transition-[box-shadow] duration-300"
          style={{ boxShadow: highlightSection === 'autofix' ? '0 0 0 2px var(--color-accent-default)' : 'none' }}
        >
        <FormLayout title="Autofix" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between">
            <div className="max-w-[420px]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Autofix</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                Automatically generate and apply code fixes using AI in a sandboxed environment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderReadyBadge('autofix')}
              <Toggle checked={autofixEnabled} onChange={() => handleToggleClick('autofix')} />
            </div>
          </div>
        </FormLayout>
        </div>

        {llmSectionVisible && (
          <div
            id="llm-section"
            className="rounded-[var(--radius-card)] transition-[box-shadow] duration-300"
            style={{ boxShadow: highlightSection === 'llm' ? '0 0 0 2px var(--color-accent-default)' : 'none' }}
          >
          <FormLayout title="LLM Provider" onSubmit={(e) => e.preventDefault()}>
            {llmSaved ? (
              <div className="flex items-center justify-between rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] px-3.5 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-success-text)]">
                    <CheckCircle2 size={14} />
                    LLM connected — {llmProviders.find(p => p.value === savedProvider)?.label ?? savedProvider}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{maskKey(savedApiKey)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleChangeProvider}>Change provider</Button>
                  <Button variant="danger" size="sm" onClick={() => setRemoveConfirmOpen(true)}>Remove</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">No LLM provider configured.</span>
                <Button variant="secondary" size="sm" onClick={handleConfigureLLM}>Configure LLM</Button>
              </div>
            )}
          </FormLayout>
          </div>
        )}
      </div>

      <Modal
        open={!!modalFor}
        onClose={handleCloseModal}
        title="Configure LLM Provider"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button disabled={!formProvider || !formApiKey || saveState === 'saving'} onClick={handleSaveLLM}>
              {saveState === 'saving' ? 'Connecting...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {modalFor && modalFor !== 'manual' && (
            <p className="text-xs text-[var(--color-text-tertiary)] -mt-1">
              Required for {toggleLabel[modalFor]}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-primary)]">Provider</label>
            <Dropdown
              options={llmProviders}
              value={formProvider}
              onChange={(v) => setFormProvider(v as string)}
              placeholder="Select provider"
            />
          </div>
          <InputField
            label="API Key"
            type={showKey ? 'text' : 'password'}
            value={formApiKey}
            onChange={(e) => { setFormApiKey(e.target.value); setSaveState('idle') }}
            placeholder="Enter API key"
            iconRight={showKey ? EyeOff : Eye}
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            className="self-start text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] -mt-2.5"
          >
            {showKey ? 'Hide key' : 'Show key'}
          </button>

          {saveState === 'error' && (
            <div className="flex items-center gap-1.5 text-[var(--color-danger-text)] text-xs">
              <XCircle size={14} /> Connection failed — check your API key
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        title="Remove LLM provider?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoveConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleRemoveLLM}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          This will disable Enrichment and Autofix. You will need to reconfigure to use these features again.
        </p>
      </Modal>
    </main>
  )
}
