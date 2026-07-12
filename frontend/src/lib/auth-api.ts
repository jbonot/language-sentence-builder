import { apiFetch, setCsrfToken } from '@/lib/api'
import type { AuthSettings, MeResponse, SavedSentence, SentenceWordSnapshot } from '@/types/auth'
import type { LanguageCode } from '@/types/word'

interface AuthActionResponse {
  user: { id: number; email: string }
  settings: AuthSettings
  csrfToken: string
}

function primeCsrf<T extends { csrfToken: string }>(response: T): T {
  setCsrfToken(response.csrfToken)
  return response
}

export async function getMe(): Promise<MeResponse> {
  const response = await apiFetch<MeResponse>('/api/auth/me/')
  return primeCsrf(response)
}

export async function register(email: string, password: string): Promise<AuthActionResponse> {
  const response = await apiFetch<AuthActionResponse>('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return primeCsrf(response)
}

export async function login(email: string, password: string): Promise<AuthActionResponse> {
  const response = await apiFetch<AuthActionResponse>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return primeCsrf(response)
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/api/auth/logout/', { method: 'POST' })
}

export async function getSettings(): Promise<AuthSettings> {
  return apiFetch<AuthSettings>('/api/auth/settings/')
}

export async function updateSettings(language: LanguageCode): Promise<AuthSettings> {
  return apiFetch<AuthSettings>('/api/auth/settings/', {
    method: 'PATCH',
    body: JSON.stringify({ language }),
  })
}

export async function listSentences(): Promise<SavedSentence[]> {
  return apiFetch<SavedSentence[]>('/api/sentences/')
}

export async function createSentence(
  language: LanguageCode,
  words: SentenceWordSnapshot[],
): Promise<SavedSentence> {
  return apiFetch<SavedSentence>('/api/sentences/', {
    method: 'POST',
    body: JSON.stringify({ language, words }),
  })
}

export async function deleteSentence(id: number): Promise<void> {
  await apiFetch<void>(`/api/sentences/${id}/`, { method: 'DELETE' })
}
