import type { LanguageCode, Word } from '@/types/word'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

let csrfToken: string | null = null

export function setCsrfToken(token: string) {
  csrfToken = token
}

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (UNSAFE_METHODS.has(method) && csrfToken) {
    headers.set('X-CSRFToken', csrfToken)
  }

  const response = await fetch(new URL(path, API_BASE_URL), {
    ...init,
    method,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? `Request failed: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json()
}

export async function fetchWords(language: LanguageCode): Promise<Word[]> {
  const url = new URL('/api/words/', API_BASE_URL)
  url.searchParams.set('language', language)
  return apiFetch<Word[]>(url.pathname + url.search)
}
