import {
  DndContext,
  DragOverlay,
  MouseSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthNav } from '@/components/auth-nav'
import { SavedSentencesPanel } from '@/components/saved-sentences-panel'
import { WordBadge } from '@/components/word-badge'
import { WordDropZone } from '@/components/word-drop-zone'
import { WordListPanel } from '@/components/word-list-panel'
import { WordWorkingSet } from '@/components/word-working-set'
import { SaveWorkingSetButton } from '@/components/save-working-set-button'
import { StarterWorkingSetsPanel } from '@/components/starter-working-sets-panel'
import { WorkingSetsPanel } from '@/components/working-sets-panel'
import { Button } from '@/components/ui/button'
import { confirm } from '@/components/ui/confirm-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SaveIcon, TrashIcon } from '@/components/icons'
import { useAuth } from '@/context/auth-context'
import { toast } from '@/hooks/use-toast'
import { fetchWords } from '@/lib/api'
import { createSentence, createWorkingSet } from '@/lib/auth-api'
import {
  insertionIndexForDrag,
  placedDraggableId,
  SENTENCE_DROPPABLE_ID,
  WORKING_SET_DROPPABLE_ID,
  type DraggableWordData,
} from '@/lib/word-drag'
import type { SavedWorkingSet } from '@/types/auth'
import { LANGUAGES, type LanguageCode, type PlacedWord, type Word } from '@/types/word'

export function Sandbox() {
  const { user, settings, status: authStatus, setLanguageSetting } = useAuth()
  const [language, setLanguage] = useState<LanguageCode>('fr')
  const [words, setWords] = useState<Word[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading')
  const [droppedWords, setDroppedWords] = useState<PlacedWord[]>([])
  const [workingSet, setWorkingSet] = useState<PlacedWord[]>([])
  const [sentencesRefreshKey, setSentencesRefreshKey] = useState(0)
  const [workingSetsRefreshKey, setWorkingSetsRefreshKey] = useState(0)
  const [activeDrag, setActiveDrag] = useState<DraggableWordData | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 1 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  useEffect(() => {
    if (authStatus !== 'ready') return
    setLanguage(settings?.language ?? 'fr')
    // Only resolve the initial language from settings once they're loaded;
    // subsequent changes come from the dropdown, not from re-syncing here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus])

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    fetchWords(language)
      .then((data) => {
        if (cancelled) return
        setWords(data)
        setStatus('idle')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [language])

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage)
    if (user) {
      setLanguageSetting(newLanguage)
    }
  }

  const handleSaveSentence = async () => {
    try {
      await createSentence(
        language,
        droppedWords.map(({ word }) => ({
          wordId: word.id,
          text: word.text,
          category: word.category,
          translation: word.translation,
        })),
      )
      setSentencesRefreshKey((prev) => prev + 1)
      toast({ description: 'Sentence saved' })
    } catch (error) {
      toast({ description: error instanceof Error ? error.message : 'Failed to save sentence' })
    }
  }

  const handleSaveWorkingSet = async (name: string) => {
    if (workingSet.length === 0) return
    try {
      await createWorkingSet(
        name,
        language,
        workingSet.map(({ word }) => ({
          wordId: word.id,
          text: word.text,
          category: word.category,
          translation: word.translation,
        })),
      )
      setWorkingSetsRefreshKey((prev) => prev + 1)
      toast({ description: 'Working set saved' })
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : 'Failed to save working set',
      })
      throw error
    }
  }

  const handleClearSentence = async () => {
    if (droppedWords.length === 0) return
    const confirmed = await confirm({
      title: 'Clear sentence',
      description: 'Clear all words from your current sentence?',
      confirmLabel: 'Clear',
      variant: 'destructive',
    })
    if (!confirmed) return
    setDroppedWords([])
  }

  const handleClearWorkingSet = async () => {
    if (workingSet.length === 0) return
    const confirmed = await confirm({
      title: 'Clear working set',
      description: 'Clear all words from your current working set?',
      confirmLabel: 'Clear',
      variant: 'destructive',
    })
    if (!confirmed) return
    setWorkingSet([])
  }

  const handleRemoveWordFromWorkingSet = (uid: string) => {
    setWorkingSet((prev) => prev.filter((item) => item.uid !== uid))
  }

  const handleLoadWorkingSet = async (saved: SavedWorkingSet) => {
    if (workingSet.length > 0) {
      const confirmed = await confirm({
        title: 'Replace working set',
        description: 'Loading will replace your current working set. Continue?',
        confirmLabel: 'Load',
      })
      if (!confirmed) return
    }
    setLanguage(saved.language)
    setWorkingSet(
      saved.words.map((snapshot) => ({
        uid: crypto.randomUUID(),
        word: {
          id: snapshot.wordId ?? -1,
          text: snapshot.text,
          category: snapshot.category,
          translation: snapshot.translation,
          language: saved.language,
        },
      })),
    )
  }

  const handleWordAddedToSentence = (word: Word, index: number) => {
    const entry = { uid: crypto.randomUUID(), word }
    setDroppedWords((prev) => [...prev.slice(0, index), entry, ...prev.slice(index)])
  }

  const handleWordReordered = (uid: string, index: number) => {
    setDroppedWords((prev) => {
      const currentIndex = prev.findIndex((item) => item.uid === uid)
      if (currentIndex === -1) return prev

      const withoutItem = prev.filter((item) => item.uid !== uid)
      const adjustedIndex = index > currentIndex ? index - 1 : index
      return [
        ...withoutItem.slice(0, adjustedIndex),
        prev[currentIndex],
        ...withoutItem.slice(adjustedIndex),
      ]
    })
  }

  const handleWordReleasedFromSentence = (uid: string) => {
    const entry = droppedWords.find((item) => item.uid === uid)
    if (!entry) return
    setDroppedWords((prev) => prev.filter((item) => item.uid !== uid))
    setWorkingSet((prev) =>
      prev.some((item) => item.word.id === entry.word.id) ? prev : [...prev, entry],
    )
  }

  const handleWordAddedToWorkingSet = (uid: string | null, word: Word) => {
    setWorkingSet((prev) => {
      if (prev.some((item) => item.word.id === word.id)) return prev
      return [...prev, { uid: uid ?? crypto.randomUUID(), word }]
    })
    if (uid) {
      setDroppedWords((prev) => prev.filter((item) => item.uid !== uid))
    }
  }

  const handleCatalogWordClick = (word: Word) => {
    handleWordAddedToWorkingSet(null, word)
    toast({ description: `Added "${word.text}" to working set` })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag(event.active.data.current as DraggableWordData)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDrag(null)
    const data = active.data.current as DraggableWordData

    if (!over) {
      if (data.type === 'placed' && droppedWords.some((item) => item.uid === data.uid)) {
        handleWordReleasedFromSentence(data.uid)
      }
      return
    }

    const isSentenceTarget =
      over.id === SENTENCE_DROPPABLE_ID ||
      droppedWords.some((item) => placedDraggableId(item.uid) === over.id)

    if (isSentenceTarget) {
      const index = insertionIndexForDrag(over, active, droppedWords)
      if (data.type === 'placed' && droppedWords.some((item) => item.uid === data.uid)) {
        handleWordReordered(data.uid, index)
      } else {
        handleWordAddedToSentence(data.word, index)
      }
      return
    }

    if (over.id === WORKING_SET_DROPPABLE_ID) {
      handleWordAddedToWorkingSet(data.type === 'placed' ? data.uid : null, data.word)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className="flex h-screen w-full overflow-hidden">
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-6 py-12">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-foreground">Sandbox</h1>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Language
                <select
                  value={language}
                  onChange={(event) => handleLanguageChange(event.target.value as LanguageCode)}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </label>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <AuthNav />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Sentence</h2>
              <div className="flex items-center gap-2">
                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={droppedWords.length === 0}
                        onClick={handleSaveSentence}
                      >
                        <SaveIcon className="size-4" />
                        Save
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save the sentence below so you can find it again later.</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={droppedWords.length === 0}
                      onClick={handleClearSentence}
                    >
                      <TrashIcon className="size-4" />
                      Clear
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove every word from the sentence below.</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <WordDropZone droppedWords={droppedWords} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Working set</h2>
              <div className="flex items-center gap-2">
                {user && (
                  <SaveWorkingSetButton
                    disabled={workingSet.length === 0}
                    onSave={handleSaveWorkingSet}
                  />
                )}
                <StarterWorkingSetsPanel onLoad={handleLoadWorkingSet} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={workingSet.length === 0}
                      onClick={handleClearWorkingSet}
                    >
                      <TrashIcon className="size-4" />
                      Clear
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove every word from the working set below.</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <WordWorkingSet words={workingSet} onRemoveWord={handleRemoveWordFromWorkingSet} />
          </div>

          <SavedSentencesPanel refreshKey={sentencesRefreshKey} />
          <WorkingSetsPanel refreshKey={workingSetsRefreshKey} onLoad={handleLoadWorkingSet} />
        </section>

        <WordListPanel words={words} status={status} onAddToWorkingSet={handleCatalogWordClick} />
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDrag && <WordBadge word={activeDrag.word} className="cursor-grabbing" />}
      </DragOverlay>
    </DndContext>
  )
}
