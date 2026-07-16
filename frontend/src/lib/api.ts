import type { LanguageCode, Word } from '@/types/word'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

let csrfToken: string | null = null

export function setCsrfToken(token: string) {
  csrfToken = token
}

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** The request never reached the server (offline, DNS failure, timeout, etc). */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

/** The server responded, but with a non-2xx status. */
export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super((body as { detail?: string })?.detail ?? `Request failed: ${status} ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (UNSAFE_METHODS.has(method) && csrfToken) {
    headers.set('X-CSRFToken', csrfToken)
  }

  let response: Response
  try {
    response = await fetch(new URL(path, API_BASE_URL), {
      ...init,
      method,
      headers,
      credentials: 'include',
    })
  } catch (error) {
    throw new NetworkError(error)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, response.statusText, body)
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
