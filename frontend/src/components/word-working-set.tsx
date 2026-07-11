import { useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { dropEffectForDrag, readDraggedWord, WORD_UID_MIME_TYPE } from '@/lib/word-drag'
import { cn } from '@/lib/utils'
import type { PlacedWord, Word } from '@/types/word'

interface WordWorkingSetProps {
  words: PlacedWord[]
  onWordAdded: (uid: string | null, word: Word) => void
}

export function WordWorkingSet({ words, onWordAdded }: WordWorkingSetProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = dropEffectForDrag(event)
        setIsDraggingOver(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        setIsDraggingOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDraggingOver(false)

        const dragged = readDraggedWord(event)
        if (!dragged) return
        const { uid, word } = dragged
        if (uid && words.some((item) => item.uid === uid)) return
        onWordAdded(uid, word)
      }}
      className={cn(
        'flex min-h-32 flex-wrap content-start items-start justify-start gap-2.5 rounded-lg border-2 border-dashed p-4 transition-colors',
        isDraggingOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
      )}
    >
      {words.length === 0 && (
        <p className="text-sm text-muted-foreground">Drag words here to keep them handy.</p>
      )}
      {words.map(({ uid, word }) => (
        <WordBadge
          key={uid}
          word={word}
          draggable
          className="cursor-grab active:cursor-grabbing"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData(WORD_UID_MIME_TYPE, uid)
            event.dataTransfer.setData('application/json', JSON.stringify(word))
          }}
        />
      ))}
    </div>
  )
}
