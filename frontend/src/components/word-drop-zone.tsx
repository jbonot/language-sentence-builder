import { type DragEvent, Fragment, useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { cn } from '@/lib/utils'
import type { Word } from '@/types/word'

export interface DroppedWord {
  uid: string
  word: Word
}

const UID_MIME_TYPE = 'application/x-dropzone-word-uid'

interface WordDropZoneProps {
  droppedWords: DroppedWord[]
  onWordDropped: (word: Word, index: number) => void
  onWordReordered: (uid: string, index: number) => void
  onWordRemoved: (uid: string) => void
}

function indexForPointer(event: DragEvent, index: number) {
  const rect = event.currentTarget.getBoundingClientRect()
  const isAfter = event.clientX - rect.left > rect.width / 2
  return isAfter ? index + 1 : index
}

export function WordDropZone({
  droppedWords,
  onWordDropped,
  onWordReordered,
  onWordRemoved,
}: WordDropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null)

  const dropAt = (event: DragEvent, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(false)
    setInsertionIndex(null)

    const uid = event.dataTransfer.getData(UID_MIME_TYPE)
    if (uid) {
      onWordReordered(uid, index)
      return
    }
    const word = event.dataTransfer.getData('application/json')
    if (!word) return
    onWordDropped(JSON.parse(word) as Word, index)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = event.dataTransfer.types.includes(UID_MIME_TYPE)
          ? 'move'
          : 'copy'
        setIsDraggingOver(true)
        setInsertionIndex(droppedWords.length)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        setIsDraggingOver(false)
        setInsertionIndex(null)
      }}
      onDrop={(event) => dropAt(event, droppedWords.length)}
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
          <WordBadge
            word={word}
            draggable
            className="cursor-grab active:cursor-grabbing"
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData(UID_MIME_TYPE, uid)
              event.dataTransfer.setData('application/json', JSON.stringify(word))
            }}
            onDragEnd={(event) => {
              setInsertionIndex(null)
              if (event.dataTransfer.dropEffect === 'none') {
                onWordRemoved(uid)
              }
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.stopPropagation()
              event.dataTransfer.dropEffect = event.dataTransfer.types.includes(UID_MIME_TYPE)
                ? 'move'
                : 'copy'
              setIsDraggingOver(true)
              setInsertionIndex(indexForPointer(event, index))
            }}
            onDrop={(event) => dropAt(event, indexForPointer(event, index))}
          />
        </Fragment>
      ))}
      {insertionIndex === droppedWords.length && droppedWords.length > 0 && <InsertionCaret />}
    </div>
  )
}

function InsertionCaret() {
  return <div className="my-0.5 h-6 w-0.5 shrink-0 self-center rounded-full bg-primary" />
}
