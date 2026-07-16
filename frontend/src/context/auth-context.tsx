import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import * as authApi from '@/lib/auth-api'
import { getStored, removeStored, setStored } from '@/lib/local-store'
import { isOfflineMode, useOfflineMode } from '@/lib/offline-mode'
import { onReauthenticated } from '@/lib/sync-queue'
import type { AuthSettings, AuthUser } from '@/types/auth'
import type { LanguageCode } from '@/types/word'

const AUTH_SNAPSHOT_KEY = 'auth-snapshot-v1'

interface AuthSnapshot {
  user: AuthUser | null
  settings: AuthSettings | null
}

function loadAuthSnapshot(): AuthSnapshot {
  return getStored<AuthSnapshot>(AUTH_SNAPSHOT_KEY, { user: null, settings: null })
}

function saveAuthSnapshot(user: AuthUser | null, settings: AuthSettings | null) {
  if (user) {
    setStored<AuthSnapshot>(AUTH_SNAPSHOT_KEY, { user, settings })
  } else {
    removeStored(AUTH_SNAPSHOT_KEY)
  }
}

interface AuthContextValue {
  user: AuthUser | null
  settings: AuthSettings | null
  status: 'loading' | 'ready'
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setLanguageSetting: (language: LanguageCode) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthSnapshot().user)
  const [settings, setSettings] = useState<AuthSettings | null>(() => loadAuthSnapshot().settings)
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const offlineMode = useOfflineMode()

  const checkSession = useCallback(async () => {
    if (isOfflineMode()) {
      setStatus('ready')
      return
    }
    try {
      const me = await authApi.getMe()
      setUser(me.user)
      setSettings(me.settings)
      saveAuthSnapshot(me.user, me.settings)
      if (me.user) onReauthenticated()
    } finally {
      setStatus('ready')
    }
  }, [])

  // Runs on mount, and again whenever offline mode is turned back off, since
  // a real network call couldn't have run (or gone stale) while it was on.
  useEffect(() => {
    checkSession()
  }, [offlineMode, checkSession])

  const register = useCallback(async (email: string, password: string) => {
    const response = await authApi.register(email, password)
    setUser(response.user)
    setSettings(response.settings)
    saveAuthSnapshot(response.user, response.settings)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    setUser(response.user)
    setSettings(response.settings)
    saveAuthSnapshot(response.user, response.settings)
    onReauthenticated()
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setSettings(null)
    saveAuthSnapshot(null, null)
  }, [])

  const setLanguageSetting = useCallback(async (language: LanguageCode) => {
    const updated = await authApi.updateSettings(language)
    setSettings(updated)
  }, [])

  return (
    <AuthContext.Provider value={{ user, settings, status, register, login, logout, setLanguageSetting }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
