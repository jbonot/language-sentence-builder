import { useSyncExternalStore } from 'react'

export interface ToastOptions {
  title?: string
  description: string
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

let toasts: ToastItem[] = []
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

export function toast({ title, description, duration = 4000 }: ToastOptions) {
  toasts = [{ id: crypto.randomUUID(), title, description, duration }]
  notify()
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id)
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return toasts
}

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
