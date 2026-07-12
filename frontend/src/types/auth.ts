import type { LanguageCode, WordCategory } from '@/types/word'

export interface AuthUser {
  id: number
  email: string
}

export interface AuthSettings {
  language: LanguageCode | null
}

export interface SentenceWordSnapshot {
  wordId: number | null
  text: string
  category: WordCategory
  translation: string | null
}

export interface SavedSentence {
  id: number
  language: LanguageCode
  words: SentenceWordSnapshot[]
  created_at: string
}

export interface MeResponse {
  authenticated: boolean
  user: AuthUser | null
  settings: AuthSettings | null
  csrfToken: string
}
