import { useEffect, useState } from 'react'

import { AuthNav } from '@/components/auth-nav'
import { SavedSentencesPanel } from '@/components/saved-sentences-panel'
import { WordDropZone } from '@/components/word-drop-zone'
import { WordListPanel } from '@/components/word-list-panel'
import { WordWorkingSet } from '@/components/word-working-set'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { fetchWords } from '@/lib/api'
import { createSentence } from '@/lib/auth-api'
import { LANGUAGES, type LanguageCode, type PlacedWord, type Word } from '@/types/word'

export function Sandbox() {
  const { user, settings, status: authStatus, setLanguageSetting } = useAuth()
  const [language, setLanguage] = useState<LanguageCode>('es')
  const [words, setWords] = useState<Word[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading')
  const [droppedWords, setDroppedWords] = useState<PlacedWord[]>([])
  const [workingSet, setWorkingSet] = useState<PlacedWord[]>([])
  const [sentencesRefreshKey, setSentencesRefreshKey] = useState(0)

  useEffect(() => {
    if (authStatus !== 'ready') return
    setLanguage(settings?.language ?? 'es')
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
  }

  const handleWordAddedToSentence = (uid: string | null, word: Word, index: number) => {
    const entry = { uid: uid ?? crypto.randomUUID(), word }
    setDroppedWords((prev) => [...prev.slice(0, index), entry, ...prev.slice(index)])
    if (uid) {
      setWorkingSet((prev) => prev.filter((item) => item.uid !== uid))
    }
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
    setWorkingSet((prev) => [...prev, entry])
  }

  const handleWordAddedToWorkingSet = (uid: string | null, word: Word) => {
    const entry = { uid: uid ?? crypto.randomUUID(), word }
    setWorkingSet((prev) => [...prev, entry])
    if (uid) {
      setDroppedWords((prev) => prev.filter((item) => item.uid !== uid))
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
            <AuthNav />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Sentence</h2>
            {user && (
              <Button
                variant="outline"
                size="sm"
                disabled={droppedWords.length === 0}
                onClick={handleSaveSentence}
              >
                Save sentence
              </Button>
            )}
          </div>
          <WordDropZone
            droppedWords={droppedWords}
            onWordAdded={handleWordAddedToSentence}
            onWordReordered={handleWordReordered}
            onWordReleased={handleWordReleasedFromSentence}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">Working set</h2>
          <WordWorkingSet words={workingSet} onWordAdded={handleWordAddedToWorkingSet} />
        </div>

        <SavedSentencesPanel refreshKey={sentencesRefreshKey} />
      </section>

      <WordListPanel words={words} status={status} />
    </div>
  )
}
