import type { LanguageCode, WordCategory } from '@/types/word'

export interface AuthUser {
  id: number
  email: string
}

export interface AuthSettings {
  language: LanguageCode | null
}

export interface WordSnapshot {
  wordId: number | null
  text: string
  category: WordCategory
  translation: string | null
}

export interface SavedSentence {
  id: number
  language: LanguageCode
  words: WordSnapshot[]
  created_at: string
}

export interface SavedWorkingSet {
  id: number
  name: string
  language: LanguageCode
  words: WordSnapshot[]
  created_at: string
}

export interface MeResponse {
  authenticated: boolean
  user: AuthUser | null
  settings: AuthSettings | null
  csrfToken: string
}
