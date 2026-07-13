import { XIcon } from '@/components/icons'
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { dismissToast, useToasts } from '@/hooks/use-toast'

export function Toaster() {
  const toasts = useToasts()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, duration }) => (
        <ToastRoot
          key={id}
          duration={duration}
          onOpenChange={(open) => {
            if (!open) dismissToast(id)
          }}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            <ToastDescription>{description}</ToastDescription>
          </div>
          <ToastClose aria-label="Dismiss">
            <XIcon className="size-4" />
          </ToastClose>
        </ToastRoot>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
