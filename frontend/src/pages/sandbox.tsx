import { useEffect, useState } from 'react'

import { WordBadge } from '@/components/word-badge'
import { type DroppedWord, WordDropZone } from '@/components/word-drop-zone'
import { fetchWords } from '@/lib/api'
import { LANGUAGES, type LanguageCode, type Word } from '@/types/word'

export function Sandbox() {
  const [language, setLanguage] = useState<LanguageCode>('es')
  const [words, setWords] = useState<Word[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading')
  const [droppedWords, setDroppedWords] = useState<DroppedWord[]>([])

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

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Sandbox</h1>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Language
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      <WordDropZone
        droppedWords={droppedWords}
        onWordDropped={(word) =>
          setDroppedWords((prev) => [...prev, { uid: crypto.randomUUID(), word }])
        }
        onWordRemoved={(uid) =>
          setDroppedWords((prev) => prev.filter((item) => item.uid !== uid))
        }
      />

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
    </section>
  )
}
