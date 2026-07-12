import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { deleteSentence, listSentences } from '@/lib/auth-api'
import type { SavedSentence } from '@/types/auth'

export function SavedSentencesPanel({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth()
  const [sentences, setSentences] = useState<SavedSentence[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    if (!user) {
      setSentences([])
      return
    }
    setStatus('loading')
    listSentences()
      .then((data) => {
        setSentences(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [user, refreshKey])

  if (!user) return null

  const handleDelete = async (id: number) => {
    await deleteSentence(id)
    setSentences((prev) => prev.filter((sentence) => sentence.id !== id))
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Saved sentences</h2>
      {status === 'loading' && <p className="text-sm text-muted-foreground">Loading...</p>}
      {status === 'error' && (
        <p className="text-sm text-destructive">Couldn't load saved sentences.</p>
      )}
      {status === 'idle' && sentences.length === 0 && (
        <p className="text-sm text-muted-foreground">No saved sentences yet.</p>
      )}
      <ul className="flex flex-col gap-2">
        {sentences.map((sentence) => (
          <li
            key={sentence.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <span>{sentence.words.map((word) => word.text).join(' ')}</span>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(sentence.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
