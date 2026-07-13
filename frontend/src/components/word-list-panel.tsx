import { useDraggable } from '@dnd-kit/core'
import { memo, useMemo, useState } from 'react'

import { WordBadge, wordBadgeVariants } from '@/components/word-badge'
import { Input } from '@/components/ui/input'
import { catalogDraggableId } from '@/lib/word-drag'
import { cn } from '@/lib/utils'
import { WORD_CATEGORIES, type Word, type WordCategory } from '@/types/word'

interface WordListPanelProps {
  words: Word[]
  status: 'idle' | 'loading' | 'error'
}

export function WordListPanel({ words, status }: WordListPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState<Set<WordCategory>>(new Set())

  const availableCategories = useMemo(
    () => WORD_CATEGORIES.filter((category) => words.some((word) => word.category === category)),
    [words],
  )

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return words.filter((word) => {
      const matchesCategory = activeCategories.size === 0 || activeCategories.has(word.category)
      const matchesQuery =
        normalizedQuery === '' ||
        word.text.toLowerCase().includes(normalizedQuery) ||
        (word.translation?.toLowerCase().includes(normalizedQuery) ?? false)
      return matchesCategory && matchesQuery
    })
  }, [words, query, activeCategories])

  const toggleCategory = (category: WordCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

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
        <div className="flex flex-col gap-3 overflow-y-auto p-3 pt-0">
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
          {status === 'idle' && words.length > 0 && (
            <>
              <Input
                type="search"
                placeholder="Search words..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search words"
              />
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((category) => {
                    const isActive = activeCategories.has(category)
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        aria-pressed={isActive}
                        className={cn(
                          wordBadgeVariants({ category }),
                          'cursor-pointer px-2.5 py-1 text-xs',
                          activeCategories.size > 0 && !isActive && 'opacity-40',
                        )}
                      >
                        {category}
                      </button>
                    )
                  })}
                  {activeCategories.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveCategories(new Set())}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {status === 'idle' && words.length > 0 && filteredWords.length === 0 && (
            <p className="text-sm text-muted-foreground">No words match your search.</p>
          )}
          <div className="flex flex-wrap gap-2.5">
            {filteredWords.map((word) => (
              <CatalogWordTile key={word.id} word={word} />
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

const CatalogWordTile = memo(function CatalogWordTile({ word }: { word: Word }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: catalogDraggableId(word),
    data: { type: 'catalog', word },
  })

  return (
    <WordBadge
      ref={setNodeRef}
      word={word}
      className={cn('cursor-grab touch-pan-y active:cursor-grabbing', isDragging && 'opacity-40')}
      {...listeners}
      {...attributes}
    />
  )
})

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
