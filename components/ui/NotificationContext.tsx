'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'

export type NotificationType =
  | 'scan_completed'
  | 'bulk_scan_completed'
  | 'autofix_completed'
  | 'bulk_autofix_completed'
  | 'team_invite_accepted'
  | 'fix_applied'

export type NotificationStatus = 'pass' | 'fail' | 'warning'

export interface NotificationLink {
  page: string
  params?: Record<string, string>
}

export interface BatchSummary {
  total: number
  failed: number
  passed: number
  warning: number
}

export interface AppNotification {
  id: string
  type: NotificationType
  content: string
  status?: NotificationStatus
  read: boolean
  created_at: number
  link: NotificationLink
  batch_id: string | null
  batch_summary: BatchSummary | null
}

interface ScanResult { repoId: string; status: NotificationStatus }
interface AutofixResult { repoId: string; fixesReady: number }

interface PendingBatch {
  kind: 'scan' | 'autofix'
  pending: Set<string>
  scanResults: ScanResult[]
  autofixResults: AutofixResult[]
  timer: ReturnType<typeof setTimeout>
}

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'created_at'>) => void
  startBatch: (kind: 'scan' | 'autofix', repoIds: string[]) => string
  reportScanResult: (repoId: string, status: NotificationStatus) => boolean
  reportAutofixResult: (repoId: string, fixesReady: number) => boolean
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const BATCH_TIMEOUT_MS = 5 * 60 * 1000

let _id = 0
function nextId() {
  return `notif-${++_id}-${Date.now()}`
}

function seedNotifications(): AppNotification[] {
  const now = Date.now()
  return [
    { id: nextId(), type: 'autofix_completed', content: 'Autofix completed — 8 fixes ready in ai-chatbot', status: undefined, read: true, created_at: now - 3 * 60 * 60 * 1000, link: { page: 'repositories', params: { repo: 'ai-chatbot' } }, batch_id: null, batch_summary: null },
    { id: nextId(), type: 'scan_completed', content: 'Scan completed — agent-pipeline · warning, 14 findings', status: 'warning', read: true, created_at: now - 26 * 60 * 60 * 1000, link: { page: 'repositories', params: { repo: 'agent-pipeline' } }, batch_id: null, batch_summary: null },
    { id: nextId(), type: 'team_invite_accepted', content: 'charlie joined the workspace', status: undefined, read: true, created_at: now - 3 * 24 * 60 * 60 * 1000, link: { page: 'members' }, batch_id: null, batch_summary: null },
  ]
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => seedNotifications())
  const batches = useRef<Map<string, PendingBatch>>(new Map())
  const repoToBatch = useRef<{ scan: Map<string, string>; autofix: Map<string, string> }>({
    scan: new Map(),
    autofix: new Map(),
  })

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'read' | 'created_at'>) => {
    setNotifications(prev => [{ ...n, id: nextId(), read: false, created_at: Date.now() }, ...prev])
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const finalizeBatch = useCallback((batchId: string) => {
    const batch = batches.current.get(batchId)
    if (!batch) return
    batches.current.delete(batchId)
    const allRepoIds = batch.kind === 'scan'
      ? batch.scanResults.map(r => r.repoId)
      : batch.autofixResults.map(r => r.repoId)
    for (const repoId of [...batch.pending, ...allRepoIds]) {
      repoToBatch.current[batch.kind].delete(repoId)
    }
    clearTimeout(batch.timer)

    if (batch.kind === 'scan') {
      const summary: BatchSummary = {
        total: batch.scanResults.length,
        failed: batch.scanResults.filter(r => r.status === 'fail').length,
        passed: batch.scanResults.filter(r => r.status === 'pass').length,
        warning: batch.scanResults.filter(r => r.status === 'warning').length,
      }
      addNotification({
        type: 'bulk_scan_completed',
        content: `Bulk scan completed — ${summary.total} repos · ${summary.failed} failed, ${summary.passed} passed, ${summary.warning} warnings`,
        link: { page: 'repositories', params: { batch: batchId } },
        batch_id: batchId,
        batch_summary: summary,
      })
    } else {
      const totalFixesReady = batch.autofixResults.reduce((sum, r) => sum + r.fixesReady, 0)
      const summary: BatchSummary = { total: batch.autofixResults.length, failed: 0, passed: 0, warning: 0 }
      addNotification({
        type: 'bulk_autofix_completed',
        content: `Bulk autofix completed — ${summary.total} repos · ${totalFixesReady} fixes ready total`,
        link: { page: 'repositories', params: { batch: batchId } },
        batch_id: batchId,
        batch_summary: summary,
      })
    }
  }, [addNotification])

  const startBatch = useCallback((kind: 'scan' | 'autofix', repoIds: string[]) => {
    const batchId = `batch-${++_id}-${Date.now()}`
    const timer = setTimeout(() => finalizeBatch(batchId), BATCH_TIMEOUT_MS)
    batches.current.set(batchId, { kind, pending: new Set(repoIds), scanResults: [], autofixResults: [], timer })
    for (const repoId of repoIds) repoToBatch.current[kind].set(repoId, batchId)
    return batchId
  }, [finalizeBatch])

  // Returns true if the repo was part of an active batch (caller should skip individual notification)
  const reportScanResult = useCallback((repoId: string, status: NotificationStatus) => {
    const batchId = repoToBatch.current.scan.get(repoId)
    if (!batchId) return false
    const batch = batches.current.get(batchId)
    if (!batch) return false
    batch.pending.delete(repoId)
    batch.scanResults.push({ repoId, status })
    if (batch.pending.size === 0) finalizeBatch(batchId)
    return true
  }, [finalizeBatch])

  const reportAutofixResult = useCallback((repoId: string, fixesReady: number) => {
    const batchId = repoToBatch.current.autofix.get(repoId)
    if (!batchId) return false
    const batch = batches.current.get(batchId)
    if (!batch) return false
    batch.pending.delete(repoId)
    batch.autofixResults.push({ repoId, fixesReady })
    if (batch.pending.size === 0) finalizeBatch(batchId)
    return true
  }, [finalizeBatch])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification, startBatch, reportScanResult, reportAutofixResult }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
