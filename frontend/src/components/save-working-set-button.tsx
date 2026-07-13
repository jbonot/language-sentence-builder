import { useEffect, useRef, useState } from 'react'

import { SaveIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SaveWorkingSetButtonProps {
  disabled: boolean
  onSave: (name: string) => Promise<void>
}

export function SaveWorkingSetButton({ disabled, onSave }: SaveWorkingSetButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleConfirm = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await onSave(trimmed)
      setName('')
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
          >
            <SaveIcon className="size-4" />
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Save the words below as a new working set, so you can load them again later.
        </TooltipContent>
      </Tooltip>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 flex min-w-56 items-center gap-2 rounded-md border border-border bg-background p-2 shadow-md">
          <Input
            ref={inputRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleConfirm()
            }}
            placeholder="Name"
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!name.trim() || saving}
            onClick={handleConfirm}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  )
}
