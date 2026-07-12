export const LANGUAGES = [
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pl', label: 'Polish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'nl', label: 'Dutch' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['value']

export const WORD_CATEGORIES = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'article',
  'interjection',
  'prefix',
  'suffix',
  'other',
] as const

export type WordCategory = (typeof WORD_CATEGORIES)[number]

export interface Word {
  id: number
  text: string
  category: WordCategory
  language: LanguageCode
  translation: string | null
}

export interface PlacedWord {
  uid: string
  word: Word
}
