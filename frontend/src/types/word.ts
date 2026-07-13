export const LANGUAGES = [
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pl', label: 'Polish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'nl', label: 'Dutch' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['value']

// Ordered to walk left-to-right through an English Subject-Verb-Object
// sentence: article/adjective/noun/pronoun build the subject (and later the
// object), verb/adverb form the predicate, and preposition/conjunction
// extend it into further phrases and clauses.
export const WORD_CATEGORIES = [
  'article',
  'adjective',
  'noun',
  'pronoun',
  'verb',
  'adverb',
  'preposition',
  'conjunction',
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
