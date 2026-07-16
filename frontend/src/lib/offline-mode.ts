import { useSyncExternalStore } from 'react'

import { getStored, setStored } from '@/lib/local-store'

const STORAGE_KEY = 'offline-mode-v1'

let enabled = getStored(STORAGE_KEY, false)
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

export function isOfflineMode() {
  return enabled
}

export function setOfflineMode(value: boolean) {
  if (value === enabled) return
  enabled = value
  setStored(STORAGE_KEY, enabled)
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return enabled
}

export function useOfflineMode() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** For non-React modules (e.g. the sync queue) that need to react to toggles. */
export const subscribeOfflineMode = subscribe
