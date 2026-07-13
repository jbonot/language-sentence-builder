import { useEffect, useRef, useState } from 'react'

import { SparklesIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!user) return null
  if (status === 'idle' && workingSets.length === 0) return null

  const handleSelect = (workingSet: SavedWorkingSet) => {
    setOpen(false)
    onLoad(workingSet)
  }

  return (
    <div ref={containerRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={status === 'loading'}
            onClick={() => setOpen((prev) => !prev)}
          >
            <SparklesIcon className="size-4" />
            Starter
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Load a ready-made starter working set to begin with words already in place.
        </TooltipContent>
      </Tooltip>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-56 rounded-md border border-border bg-background p-1 shadow-md">
          {status === 'error' && (
            <p className="px-2 py-1.5 text-sm text-destructive">
              Couldn't load starter working sets.
            </p>
          )}
          {status !== 'error' &&
            workingSets.map((workingSet) => (
              <button
                key={workingSet.id}
                type="button"
                className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => handleSelect(workingSet)}
              >
                {workingSet.name}{' '}
                <span className="text-muted-foreground">({workingSet.words.length} words)</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
