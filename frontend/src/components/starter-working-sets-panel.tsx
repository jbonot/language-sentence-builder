import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { listStarterWorkingSets } from '@/lib/auth-api'
import type { SavedWorkingSet } from '@/types/auth'

interface StarterWorkingSetsPanelProps {
  onLoad: (workingSet: SavedWorkingSet) => void
}

export function StarterWorkingSetsPanel({ onLoad }: StarterWorkingSetsPanelProps) {
  const { user } = useAuth()
  const [workingSets, setWorkingSets] = useState<SavedWorkingSet[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    if (!user) {
      setWorkingSets([])
      return
    }
    setStatus('loading')
    listStarterWorkingSets()
      .then((data) => {
        setWorkingSets(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [user])

  if (!user) return null
  if (status === 'idle' && workingSets.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Starter working sets</h2>
      {status === 'loading' && <p className="text-sm text-muted-foreground">Loading...</p>}
      {status === 'error' && (
        <p className="text-sm text-destructive">Couldn't load starter working sets.</p>
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
            <Button variant="outline" size="sm" onClick={() => onLoad(workingSet)}>
              Load
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
