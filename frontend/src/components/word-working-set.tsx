import { useDraggable, useDroppable } from '@dnd-kit/core'

import { WordBadge } from '@/components/word-badge'
import { placedDraggableId, WORKING_SET_DROPPABLE_ID } from '@/lib/word-drag'
import { cn } from '@/lib/utils'
import type { PlacedWord } from '@/types/word'

interface WordWorkingSetProps {
  words: PlacedWord[]
}

export function WordWorkingSet({ words }: WordWorkingSetProps) {
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
        <PlacedWordTile key={uid} uid={uid} word={word} />
      ))}
    </div>
  )
}

function PlacedWordTile({ uid, word }: PlacedWord) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: placedDraggableId(uid),
    data: { type: 'placed', uid, word },
  })

  return (
    <WordBadge
      ref={setNodeRef}
      word={word}
      className={cn('cursor-grab touch-none active:cursor-grabbing', isDragging && 'opacity-40')}
      {...listeners}
      {...attributes}
    />
  )
}
