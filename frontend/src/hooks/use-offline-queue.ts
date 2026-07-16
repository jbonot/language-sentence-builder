import { useSyncExternalStore } from 'react'

import {
  cancelPendingCreate,
  discardItem,
  getAuthExpired,
  getQueueSnapshot,
  retryItem,
  subscribeQueue,
  type QueueItem,
  type QueueItemKind,
} from '@/lib/sync-queue'

function pendingFor(queue: QueueItem[], kind: QueueItemKind) {
  return queue.filter((item) => item.kind === kind)
}

export function useOfflineQueue() {
  const queue = useSyncExternalStore(subscribeQueue, getQueueSnapshot)
  const authExpired = useSyncExternalStore(subscribeQueue, getAuthExpired)

  return {
    pendingSentences: pendingFor(queue, 'createSentence'),
    pendingSentenceDeletes: pendingFor(queue, 'deleteSentence'),
    pendingWorkingSets: pendingFor(queue, 'createWorkingSet'),
    pendingWorkingSetDeletes: pendingFor(queue, 'deleteWorkingSet'),
    authExpired,
    retryItem,
    discardItem,
    cancelPendingCreate,
  }
}
