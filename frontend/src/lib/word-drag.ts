import type { DragEvent } from 'react'

import type { Word } from '@/types/word'

/**
 * Present on a drag whenever the dragged item is an existing PlacedWord
 * (already living in the Sentence or the Working Set). Absent when the
 * drag originates fresh from the immutable full word list.
 */
export const WORD_UID_MIME_TYPE = 'application/x-word-uid'

export function readDraggedWord(event: DragEvent): { uid: string | null; word: Word } | null {
  const raw = event.dataTransfer.getData('application/json')
  if (!raw) return null
  return {
    uid: event.dataTransfer.getData(WORD_UID_MIME_TYPE) || null,
    word: JSON.parse(raw) as Word,
  }
}

export function dropEffectForDrag(event: DragEvent): 'copy' | 'move' {
  return event.dataTransfer.types.includes(WORD_UID_MIME_TYPE) ? 'move' : 'copy'
}
