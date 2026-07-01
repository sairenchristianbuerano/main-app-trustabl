'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SettingsContextValue {
  enrichmentEnabled: boolean
  autofixEnabled: boolean
  llmProvider: string
  llmApiKey: string
  setEnrichmentEnabled: (value: boolean) => void
  setAutofixEnabled: (value: boolean) => void
  setLlmConfig: (provider: string, apiKey: string) => void
  clearLlmConfig: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

// Plain in-memory state, same pattern as RepoContext — resets on every full
// page refresh instead of leaking across sessions the way localStorage does.
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [enrichmentEnabled, setEnrichmentEnabled] = useState(false)
  const [autofixEnabled, setAutofixEnabled] = useState(false)
  const [llmProvider, setLlmProvider] = useState('')
  const [llmApiKey, setLlmApiKey] = useState('')

  const setLlmConfig = useCallback((provider: string, apiKey: string) => {
    setLlmProvider(provider)
    setLlmApiKey(apiKey)
  }, [])

  const clearLlmConfig = useCallback(() => {
    setLlmProvider('')
    setLlmApiKey('')
    setEnrichmentEnabled(false)
    setAutofixEnabled(false)
  }, [])

  return (
    <SettingsContext.Provider value={{
      enrichmentEnabled, autofixEnabled, llmProvider, llmApiKey,
      setEnrichmentEnabled, setAutofixEnabled, setLlmConfig, clearLlmConfig,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
