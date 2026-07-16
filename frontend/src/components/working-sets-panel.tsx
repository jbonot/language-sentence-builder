import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useOfflineQueue } from '@/hooks/use-offline-queue'
import { toast } from '@/hooks/use-toast'
import { listWorkingSetsCached } from '@/lib/cached-reads'
import { deleteWorkingSetOffline } from '@/lib/offline-write'
import type { CreateWorkingSetPayload, DeleteWorkingSetPayload } from '@/lib/sync-queue'
import type { SavedWorkingSet } from '@/types/auth'

interface WorkingSetsPanelProps {
  refreshKey: number
  onLoad: (workingSet: SavedWorkingSet) => void
}

export function WorkingSetsPanel({ refreshKey, onLoad }: WorkingSetsPanelProps) {
  const { user } = useAuth()
  const [workingSets, setWorkingSets] = useState<SavedWorkingSet[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const { pendingWorkingSets, pendingWorkingSetDeletes, cancelPendingCreate, retryItem, discardItem } =
    useOfflineQueue()

  useEffect(() => {
    if (!user) {
      setWorkingSets([])
      return
    }
    setStatus('loading')
    listWorkingSetsCached()
      .then((data) => {
        setWorkingSets(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [user, refreshKey])

  if (!user) return null

  const pendingDeleteIds = new Set(
    pendingWorkingSetDeletes.map((item) => (item.payload as DeleteWorkingSetPayload).id),
  )
  const visibleWorkingSets = workingSets.filter((workingSet) => !pendingDeleteIds.has(workingSet.id))

  const handleDelete = async (id: number) => {
    try {
      const { queued } = await deleteWorkingSetOffline(id)
      if (!queued) {
        setWorkingSets((prev) => prev.filter((workingSet) => workingSet.id !== id))
      }
      toast({ description: queued ? "Will delete once you're back online" : 'Working set deleted' })
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : 'Failed to delete working set',
      })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Saved working sets</h2>
      {status === 'loading' && <p className="text-sm text-muted-foreground">Loading...</p>}
      {status === 'error' && (
        <p className="text-sm text-destructive">Couldn't load saved working sets.</p>
      )}
      {status === 'idle' && visibleWorkingSets.length === 0 && pendingWorkingSets.length === 0 && (
        <p className="text-sm text-muted-foreground">No saved working sets yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {visibleWorkingSets.map((workingSet) => (
          <li
            key={workingSet.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <span>
              {workingSet.name}{' '}
              <span className="text-muted-foreground">({workingSet.words.length} words)</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onLoad(workingSet)}>
                Load
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(workingSet.id)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
        {pendingWorkingSets.map((item) => {
          const payload = item.payload as CreateWorkingSetPayload
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm"
            >
              <span>
                {payload.name} <span className="text-muted-foreground">({payload.words.length} words)</span>{' '}
                <span className="text-xs text-muted-foreground">
                  {item.status === 'failed' ? `— ${item.lastError ?? 'Failed to sync'}` : '— pending sync'}
                </span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onLoad({
                      id: -1,
                      name: payload.name,
                      language: payload.language,
                      words: payload.words,
                      created_at: new Date().toISOString(),
                    })
                  }
                >
                  Load
                </Button>
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
