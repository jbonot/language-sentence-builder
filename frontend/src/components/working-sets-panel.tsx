import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { deleteWorkingSet, listWorkingSets } from '@/lib/auth-api'
import type { SavedWorkingSet } from '@/types/auth'

interface WorkingSetsPanelProps {
  refreshKey: number
  onLoad: (workingSet: SavedWorkingSet) => void
}

export function WorkingSetsPanel({ refreshKey, onLoad }: WorkingSetsPanelProps) {
  const { user } = useAuth()
  const [workingSets, setWorkingSets] = useState<SavedWorkingSet[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    if (!user) {
      setWorkingSets([])
      return
    }
    setStatus('loading')
    listWorkingSets()
      .then((data) => {
        setWorkingSets(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [user, refreshKey])

  if (!user) return null

  const handleDelete = async (id: number) => {
    await deleteWorkingSet(id)
    setWorkingSets((prev) => prev.filter((workingSet) => workingSet.id !== id))
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Saved working sets</h2>
      {status === 'loading' && <p className="text-sm text-muted-foreground">Loading...</p>}
      {status === 'error' && (
        <p className="text-sm text-destructive">Couldn't load saved working sets.</p>
      )}
      {status === 'idle' && workingSets.length === 0 && (
        <p className="text-sm text-muted-foreground">No saved working sets yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {workingSets.map((workingSet) => (
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
      </ul>
    </div>
  )
}
