import { fetchWords } from '@/lib/api'
import { listSentences, listWorkingSets } from '@/lib/auth-api'
import { getStored, setStored } from '@/lib/local-store'
import { isOfflineMode } from '@/lib/offline-mode'
import type { SavedSentence, SavedWorkingSet } from '@/types/auth'
import type { LanguageCode, Word } from '@/types/word'

const SENTENCES_CACHE_KEY = 'cached-sentences-v1'
const WORKING_SETS_CACHE_KEY = 'cached-working-sets-v1'

function wordsCacheKey(language: LanguageCode) {
  return `cached-words-${language}-v1`
}

export async function fetchWordsCached(language: LanguageCode): Promise<Word[]> {
  if (isOfflineMode()) {
    return getStored<Word[]>(wordsCacheKey(language), [])
  }
  const data = await fetchWords(language)
  setStored(wordsCacheKey(language), data)
  return data
}

export async function listSentencesCached(): Promise<SavedSentence[]> {
  if (isOfflineMode()) {
    return getStored<SavedSentence[]>(SENTENCES_CACHE_KEY, [])
  }
  const data = await listSentences()
  setStored(SENTENCES_CACHE_KEY, data)
  return data
}

export async function listWorkingSetsCached(): Promise<SavedWorkingSet[]> {
  if (isOfflineMode()) {
    return getStored<SavedWorkingSet[]>(WORKING_SETS_CACHE_KEY, [])
  }
  const data = await listWorkingSets()
  setStored(WORKING_SETS_CACHE_KEY, data)
  return data
}
