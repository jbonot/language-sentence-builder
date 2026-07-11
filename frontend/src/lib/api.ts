import type { LanguageCode, Word } from '@/types/word'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function fetchWords(language: LanguageCode): Promise<Word[]> {
  const url = new URL('/api/words/', API_BASE_URL)
  url.searchParams.set('language', language)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch words: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
