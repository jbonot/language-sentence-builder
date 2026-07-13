import * as ToastPrimitive from '@radix-ui/react-toast'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none',
        className,
      )}
      {...props}
    />
  )
}

function ToastRoot({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Root
      className={cn(
        'pointer-events-auto relative flex items-start justify-between gap-2 rounded-md border border-border bg-background p-4 pr-8 text-foreground shadow-md',
        'data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out',
        'data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
        'data-[swipe=end]:animate-toast-out',
        className,
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return <ToastPrimitive.Title className={cn('text-sm font-semibold', className)} {...props} />
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { ToastProvider, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose }
