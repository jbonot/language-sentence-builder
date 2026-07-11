import { useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { cn } from '@/lib/utils'
import type { Word } from '@/types/word'

export interface DroppedWord {
  uid: string
  word: Word
}

interface WordDropZoneProps {
  droppedWords: DroppedWord[]
  onWordDropped: (word: Word) => void
}

export function WordDropZone({ droppedWords, onWordDropped }: WordDropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDraggingOver(true)
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDraggingOver(false)
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
        <WordBadge key={uid} word={word} />
      ))}
    </div>
  )
}
