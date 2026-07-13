import { useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core'
import { Fragment, useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { insertionIndexForDrag, placedDraggableId, SENTENCE_DROPPABLE_ID } from '@/lib/word-drag'
import { cn } from '@/lib/utils'
import type { PlacedWord } from '@/types/word'

interface WordDropZoneProps {
  droppedWords: PlacedWord[]
}

function isOverSentence(overId: string | number, droppedWords: PlacedWord[]) {
  return (
    overId === SENTENCE_DROPPABLE_ID ||
    droppedWords.some((item) => placedDraggableId(item.uid) === overId)
  )
}

export function WordDropZone({ droppedWords }: WordDropZoneProps) {
  const { setNodeRef } = useDroppable({ id: SENTENCE_DROPPABLE_ID })
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null)

  useDndMonitor({
    onDragMove(event) {
      const { active, over } = event
      if (!over || !isOverSentence(over.id, droppedWords)) {
        setIsDraggingOver(false)
        setInsertionIndex(null)
        return
      }
      setIsDraggingOver(true)
      setInsertionIndex(insertionIndexForDrag(over, active, droppedWords))
    },
    onDragEnd() {
      setIsDraggingOver(false)
      setInsertionIndex(null)
    },
    onDragCancel() {
      setIsDraggingOver(false)
      setInsertionIndex(null)
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-32 flex-wrap content-start items-start justify-start gap-2.5 rounded-lg border-2 border-dashed p-4 transition-colors',
        isDraggingOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
      )}
    >
      {droppedWords.length === 0 && (
        <p className="text-sm text-muted-foreground">Drag words here to build a sentence.</p>
      )}
      {droppedWords.map(({ uid, word }, index) => (
        <Fragment key={uid}>
          {insertionIndex === index && <InsertionCaret />}
          <PlacedSentenceTile uid={uid} word={word} />
        </Fragment>
      ))}
      {insertionIndex === droppedWords.length && droppedWords.length > 0 && <InsertionCaret />}
    </div>
  )
}

function PlacedSentenceTile({ uid, word }: PlacedWord) {
  const draggable = useDraggable({
    id: placedDraggableId(uid),
    data: { type: 'placed', uid, word },
  })
  const droppable = useDroppable({ id: placedDraggableId(uid) })

  const setNodeRef = (node: HTMLElement | null) => {
    draggable.setNodeRef(node)
    droppable.setNodeRef(node)
  }

  return (
    <WordBadge
      ref={setNodeRef}
      word={word}
      className={cn(
        'cursor-grab touch-none active:cursor-grabbing',
        draggable.isDragging && 'opacity-40',
      )}
      {...draggable.listeners}
      {...draggable.attributes}
    />
  )
}

function InsertionCaret() {
  return <div className="my-0.5 h-6 w-0.5 shrink-0 self-center rounded-full bg-primary" />
}
