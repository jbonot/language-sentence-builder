import { useDraggable, useDroppable } from '@dnd-kit/core'
import { memo, useEffect, useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { placedDraggableId, WORKING_SET_DROPPABLE_ID } from '@/lib/word-drag'
import { cn } from '@/lib/utils'
import type { PlacedWord } from '@/types/word'

interface WordWorkingSetProps {
  words: PlacedWord[]
  onRemoveWord: (uid: string) => void
}

export function WordWorkingSet({ words, onRemoveWord }: WordWorkingSetProps) {
  const { setNodeRef, isOver } = useDroppable({ id: WORKING_SET_DROPPABLE_ID })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-32 flex-wrap content-start items-start justify-start gap-2.5 rounded-lg border-2 border-dashed p-4 transition-colors',
        isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
      )}
    >
      {words.length === 0 && (
        <p className="text-sm text-muted-foreground">Drag words here to keep them handy.</p>
      )}
      {words.map(({ uid, word }) => (
        <PlacedWordTile key={uid} uid={uid} word={word} onRemoveWord={onRemoveWord} />
      ))}
    </div>
  )
}

interface PlacedWordTileProps extends PlacedWord {
  onRemoveWord: (uid: string) => void
}

const PlacedWordTile = memo(function PlacedWordTile({ uid, word, onRemoveWord }: PlacedWordTileProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: placedDraggableId(uid),
    data: { type: 'placed', uid, word },
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (isDragging) setMenuOpen(false)
  }, [isDragging])

  return (
    <WordBadge
      ref={setNodeRef}
      word={word}
      onRemove={() => onRemoveWord(uid)}
      menuOpen={menuOpen}
      onMenuOpenChange={setMenuOpen}
      className={cn('cursor-grab touch-pan-y active:cursor-grabbing', isDragging && 'opacity-40')}
      {...listeners}
      {...attributes}
    />
  )
})
