import { useEffect } from 'react'
import { createCallable } from 'react-call'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmProps {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

const DIALOG_EXIT_DURATION = 150

export const ConfirmDialog = createCallable<ConfirmProps, boolean>(({
  call,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') call.end(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [call])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4',
        call.ended ? 'animate-overlay-out' : 'animate-overlay-in',
      )}
      onClick={() => call.end(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? 'confirm-dialog-title' : undefined}
        aria-describedby="confirm-dialog-description"
        className={cn(
          'w-full max-w-sm rounded-md border border-border bg-background p-4 shadow-md',
          call.ended ? 'animate-dialog-out' : 'animate-dialog-in',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <h2 id="confirm-dialog-title" className="text-sm font-semibold text-foreground">
            {title}
          </h2>
        )}
        <p id="confirm-dialog-description" className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => call.end(false)}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" autoFocus onClick={() => call.end(true)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}, DIALOG_EXIT_DURATION)

export function confirm(props: ConfirmProps) {
  return ConfirmDialog.call(props)
}
