import type { Active, Over } from '@dnd-kit/core'

import type { PlacedWord, Word } from '@/types/word'

/**
 * Data carried by every draggable word tile, disambiguating a fresh pull
 * from the immutable word catalog (copy semantics) from an existing
 * PlacedWord already living in the Sentence or the Working Set (move
 * semantics).
 */
export type DraggableWordData =
  | { type: 'catalog'; word: Word }
  | { type: 'placed'; uid: string; word: Word }

export const SENTENCE_DROPPABLE_ID = 'sentence'
export const WORKING_SET_DROPPABLE_ID = 'working-set'

export function catalogDraggableId(word: Word) {
  return `word-${word.id}`
}

export function placedDraggableId(uid: string) {
  return `placed-${uid}`
}

/**
 * Direct port of the pre-dnd-kit `indexForPointer`: compares the dragged
 * tile's center X against the hovered tile's center X to decide whether it
 * should land before or after it. Sourced from dnd-kit's continuously
 * measured rects instead of a raw pointer event.
 */
export function insertionIndexForDrag(
  over: Over,
  active: Active,
  droppedWords: PlacedWord[],
): number {
  if (over.id === SENTENCE_DROPPABLE_ID) return droppedWords.length

  const overIndex = droppedWords.findIndex((item) => placedDraggableId(item.uid) === over.id)
  if (overIndex === -1) return droppedWords.length

  const activeRect = active.rect.current.translated
  if (!activeRect) return overIndex

  const activeCenterX = activeRect.left + activeRect.width / 2
  const overCenterX = over.rect.left + over.rect.width / 2
  return activeCenterX > overCenterX ? overIndex + 1 : overIndex
}
