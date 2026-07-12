import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import * as authApi from '@/lib/auth-api'
import type { AuthSettings, AuthUser } from '@/types/auth'
import type { LanguageCode } from '@/types/word'

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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [settings, setSettings] = useState<AuthSettings | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    authApi
      .getMe()
      .then((me) => {
        setUser(me.user)
        setSettings(me.settings)
      })
      .finally(() => setStatus('ready'))
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const response = await authApi.register(email, password)
    setUser(response.user)
    setSettings(response.settings)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    setUser(response.user)
    setSettings(response.settings)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setSettings(null)
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
