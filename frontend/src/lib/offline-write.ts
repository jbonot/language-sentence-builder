import { NetworkError } from '@/lib/api'
import { createSentence, createWorkingSet, deleteSentence, deleteWorkingSet } from '@/lib/auth-api'
import { isOfflineMode } from '@/lib/offline-mode'
import { enqueue } from '@/lib/sync-queue'
import type { WordSnapshot } from '@/types/auth'
import type { LanguageCode } from '@/types/word'

export async function createSentenceOffline(
  language: LanguageCode,
  words: WordSnapshot[],
): Promise<{ queued: boolean }> {
  if (isOfflineMode()) {
    enqueue('createSentence', { language, words })
    return { queued: true }
  }
  try {
    await createSentence(language, words)
    return { queued: false }
  } catch (error) {
    if (error instanceof NetworkError) {
      enqueue('createSentence', { language, words })
      return { queued: true }
    }
    throw error
  }
}

export async function createWorkingSetOffline(
  name: string,
  language: LanguageCode,
  words: WordSnapshot[],
): Promise<{ queued: boolean }> {
  if (isOfflineMode()) {
    enqueue('createWorkingSet', { name, language, words })
    return { queued: true }
  }
  try {
    await createWorkingSet(name, language, words)
    return { queued: false }
  } catch (error) {
    if (error instanceof NetworkError) {
      enqueue('createWorkingSet', { name, language, words })
      return { queued: true }
    }
    throw error
  }
}

export async function deleteSentenceOffline(id: number): Promise<{ queued: boolean }> {
  if (isOfflineMode()) {
    enqueue('deleteSentence', { id })
    return { queued: true }
  }
  try {
    await deleteSentence(id)
    return { queued: false }
  } catch (error) {
    if (error instanceof NetworkError) {
      enqueue('deleteSentence', { id })
      return { queued: true }
    }
    throw error
  }
}

export async function deleteWorkingSetOffline(id: number): Promise<{ queued: boolean }> {
  if (isOfflineMode()) {
    enqueue('deleteWorkingSet', { id })
    return { queued: true }
  }
  try {
    await deleteWorkingSet(id)
    return { queued: false }
  } catch (error) {
    if (error instanceof NetworkError) {
      enqueue('deleteWorkingSet', { id })
      return { queued: true }
    }
    throw error
  }
}
