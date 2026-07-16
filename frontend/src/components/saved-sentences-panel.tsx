import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useOfflineQueue } from '@/hooks/use-offline-queue'
import { toast } from '@/hooks/use-toast'
import { listSentencesCached } from '@/lib/cached-reads'
import { deleteSentenceOffline } from '@/lib/offline-write'
import type { CreateSentencePayload, DeleteSentencePayload } from '@/lib/sync-queue'
import type { SavedSentence } from '@/types/auth'

export function SavedSentencesPanel({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [sentences, setSentences] = useState<SavedSentence[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const { pendingSentences, pendingSentenceDeletes, cancelPendingCreate, retryItem, discardItem } =
    useOfflineQueue()

  useEffect(() => {
    if (!user) {
      setSentences([])
      return
    }
    setStatus('loading')
    listSentencesCached()
      .then((data) => {
        setSentences(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [user, refreshKey])

  if (!user) return null

  const pendingDeleteIds = new Set(
    pendingSentenceDeletes.map((item) => (item.payload as DeleteSentencePayload).id),
  )
  const visibleSentences = sentences.filter((sentence) => !pendingDeleteIds.has(sentence.id))

  const handleDelete = async (id: number) => {
    try {
      const { queued } = await deleteSentenceOffline(id)
      if (!queued) {
        setSentences((prev) => prev.filter((sentence) => sentence.id !== id))
      }
      toast({ description: queued ? "Will delete once you're back online" : 'Sentence deleted' })
    } catch (error) {
      toast({ description: error instanceof Error ? error.message : 'Failed to delete sentence' })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Saved sentences</h2>
      {status === 'loading' && <p className="text-sm text-muted-foreground">Loading...</p>}
      {status === 'error' && (
        <p className="text-sm text-destructive">Couldn't load saved sentences.</p>
      )}
      {status === 'idle' && visibleSentences.length === 0 && pendingSentences.length === 0 && (
        <p className="text-sm text-muted-foreground">No saved sentences yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {visibleSentences.map((sentence) => (
          <li
            key={sentence.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <span>{sentence.words.map((word) => word.text).join(' ')}</span>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(sentence.id)}>
              Delete
            </Button>
          </li>
        ))}
        {pendingSentences.map((item) => {
          const payload = item.payload as CreateSentencePayload
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm"
            >
              <span>
                {payload.words.map((word) => word.text).join(' ')}{' '}
                <span className="text-xs text-muted-foreground">
                  {item.status === 'failed' ? `— ${item.lastError ?? 'Failed to sync'}` : '— pending sync'}
                </span>
              </span>
              <div className="flex gap-2">
                {item.status === 'failed' && (
                  <Button variant="outline" size="sm" onClick={() => retryItem(item.id)}>
                    Retry
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    item.status === 'failed' ? discardItem(item.id) : cancelPendingCreate(item.id)
                  }
                >
                  Discard
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
