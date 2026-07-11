import { useState } from 'react'

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
  onWordDropped: (word: Word) => void
  onWordRemoved: (uid: string) => void
}

export function WordDropZone({ droppedWords, onWordDropped, onWordRemoved }: WordDropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = event.dataTransfer.types.includes(UID_MIME_TYPE)
          ? 'move'
          : 'copy'
        setIsDraggingOver(true)
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDraggingOver(false)
        // A word already in the zone was dropped back onto the zone: nothing to do.
        if (event.dataTransfer.getData(UID_MIME_TYPE)) return
        const word = event.dataTransfer.getData('application/json')
        if (!word) return
        onWordDropped(JSON.parse(word) as Word)
      }}
      className={cn(
        'flex min-h-32 flex-wrap content-start items-start justify-start gap-2.5 rounded-lg border-2 border-dashed p-4 transition-colors',
        isDraggingOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
      )}
    >
      {droppedWords.length === 0 && (
        <p className="text-sm text-muted-foreground">Drag words here to build a sentence.</p>
      )}
      {droppedWords.map(({ uid, word }) => (
        <WordBadge
          key={uid}
          word={word}
          draggable
          className="cursor-grab active:cursor-grabbing"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData(UID_MIME_TYPE, uid)
            event.dataTransfer.setData('application/json', JSON.stringify(word))
          }}
          onDragEnd={(event) => {
            if (event.dataTransfer.dropEffect === 'none') {
              onWordRemoved(uid)
            }
          }}
        />
      ))}
    </div>
  )
}
