import { ApiError, NetworkError } from '@/lib/api'
import { createSentence, createWorkingSet, deleteSentence, deleteWorkingSet, getMe } from '@/lib/auth-api'
import { getStored, setStored } from '@/lib/local-store'
import { isOfflineMode, subscribeOfflineMode } from '@/lib/offline-mode'
import type { WordSnapshot } from '@/types/auth'
import type { LanguageCode } from '@/types/word'

const QUEUE_KEY = 'offline-queue-v1'
const MAX_ATTEMPTS = 10

export type QueueItemKind = 'createSentence' | 'createWorkingSet' | 'deleteSentence' | 'deleteWorkingSet'

export interface CreateSentencePayload {
  language: LanguageCode
  words: WordSnapshot[]
}
export interface CreateWorkingSetPayload {
  name: string
  language: LanguageCode
  words: WordSnapshot[]
}
export interface DeleteSentencePayload {
  id: number
}
export interface DeleteWorkingSetPayload {
  id: number
}

export type QueueItemPayload =
  | CreateSentencePayload
  | CreateWorkingSetPayload
  | DeleteSentencePayload
  | DeleteWorkingSetPayload

export interface QueueItem {
  id: string
  kind: QueueItemKind
  payload: QueueItemPayload
  status: 'pending' | 'failed'
  attempts: number
  createdAt: number
  lastError?: string
}

let queue: QueueItem[] = getStored<QueueItem[]>(QUEUE_KEY, [])
let authExpired = false
let isProcessing = false
const listeners = new Set<() => void>()

function persist() {
  setStored(QUEUE_KEY, queue)
}

function notify() {
  for (const listener of listeners) listener()
}

export function subscribeQueue(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getQueueSnapshot() {
  return queue
}

export function getAuthExpired() {
  return authExpired
}

export function enqueue(kind: QueueItemKind, payload: QueueItemPayload): string {
  const id = crypto.randomUUID()
  queue = [...queue, { id, kind, payload, status: 'pending', attempts: 0, createdAt: Date.now() }]
  persist()
  notify()
  return id
}

/** Removes a not-yet-synced item without ever hitting the network (e.g. it was deleted locally before reconnecting). */
export function cancelPendingCreate(id: string) {
  queue = queue.filter((item) => item.id !== id)
  persist()
  notify()
}

export function discardItem(id: string) {
  queue = queue.filter((item) => item.id !== id)
  persist()
  notify()
}

export function retryItem(id: string) {
  queue = queue.map((item) => (item.id === id ? { ...item, status: 'pending' as const } : item))
  persist()
  notify()
  processQueue()
}

export function onReauthenticated() {
  authExpired = false
  notify()
  processQueue()
}

async function performItem(item: QueueItem) {
  switch (item.kind) {
    case 'createSentence': {
      const { language, words } = item.payload as CreateSentencePayload
      await createSentence(language, words)
      return
    }
    case 'createWorkingSet': {
      const { name, language, words } = item.payload as CreateWorkingSetPayload
      await createWorkingSet(name, language, words)
      return
    }
    case 'deleteSentence': {
      const { id } = item.payload as DeleteSentencePayload
      await deleteSentence(id)
      return
    }
    case 'deleteWorkingSet': {
      const { id } = item.payload as DeleteWorkingSetPayload
      await deleteWorkingSet(id)
      return
    }
  }
}

type ReplayOutcome = 'ok' | 'network' | 'authExpired' | 'validation' | 'server'

async function replay(item: QueueItem): Promise<{ outcome: ReplayOutcome; message?: string }> {
  try {
    await performItem(item)
    return { outcome: 'ok' }
  } catch (error) {
    if (error instanceof NetworkError) return { outcome: 'network' }
    if (error instanceof ApiError) {
      // A queued delete for something already gone server-side is a no-op success.
      if (error.status === 404 && item.kind.startsWith('delete')) return { outcome: 'ok' }
      if (error.status === 401 || error.status === 403) return { outcome: 'authExpired' }
      if (error.status >= 400 && error.status < 500) return { outcome: 'validation', message: error.message }
      return { outcome: 'server', message: error.message }
    }
    return { outcome: 'validation', message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function processQueue() {
  if (isProcessing || isOfflineMode() || queue.length === 0) return
  isProcessing = true
  try {
    try {
      await getMe()
    } catch (error) {
      if (error instanceof NetworkError) return
      // Any other getMe() failure: proceed and let per-item replay surface it.
    }

    for (const item of queue) {
      if (item.status === 'failed') continue
      if (!queue.some((q) => q.id === item.id)) continue // removed mid-loop (discarded/cancelled)

      const { outcome, message } = await replay(item)

      if (outcome === 'ok') {
        queue = queue.filter((q) => q.id !== item.id)
        persist()
        notify()
        continue
      }
      if (outcome === 'network') {
        break
      }
      if (outcome === 'authExpired') {
        authExpired = true
        notify()
        break
      }
      if (outcome === 'validation') {
        queue = queue.map((q) => (q.id === item.id ? { ...q, status: 'failed' as const, lastError: message } : q))
        persist()
        notify()
        continue
      }
      // server error: back off, retry later up to a cap
      const attempts = item.attempts + 1
      queue = queue.map((q) =>
        q.id === item.id
          ? attempts >= MAX_ATTEMPTS
            ? { ...q, status: 'failed' as const, attempts, lastError: message }
            : { ...q, attempts }
          : q,
      )
      persist()
      notify()
      break
    }
  } finally {
    isProcessing = false
  }
}

let wasOffline = isOfflineMode()
subscribeOfflineMode(() => {
  const nowOffline = isOfflineMode()
  if (wasOffline && !nowOffline) {
    processQueue()
  }
  wasOffline = nowOffline
})

if (!isOfflineMode() && queue.length > 0) {
  processQueue()
}
