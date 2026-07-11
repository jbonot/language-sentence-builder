import { useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { cn } from '@/lib/utils'
import type { Word } from '@/types/word'

interface WordListPanelProps {
  words: Word[]
  status: 'idle' | 'loading' | 'error'
}

export function WordListPanel({ words, status }: WordListPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-l border-border bg-background transition-[width] duration-200',
        isOpen ? 'w-72' : 'w-12',
      )}
    >
      <div className="flex items-center gap-2 p-3">
        {isOpen && (
          <h2 className="text-sm font-semibold text-foreground">Word list</h2>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Collapse word list' : 'Expand word list'}
          aria-expanded={isOpen}
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronIcon className={cn('size-4 transition-transform', !isOpen && 'rotate-180')} />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-2 overflow-y-auto p-3 pt-0">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">Loading words...</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-destructive">
              Couldn't load words. Is the backend running?
            </p>
          )}
          {status === 'idle' && words.length === 0 && (
            <p className="text-sm text-muted-foreground">No words for this language yet.</p>
          )}
          <div className="flex flex-wrap gap-2.5">
            {words.map((word) => (
              <WordBadge
                key={word.id}
                word={word}
                draggable
                className="cursor-grab active:cursor-grabbing"
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'copy'
                  event.dataTransfer.setData('application/json', JSON.stringify(word))
                }}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
