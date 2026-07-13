import { Link } from 'react-router-dom'

import { WordBadge } from '@/components/word-badge'
import type { Word } from '@/types/word'

const titleWords: Word[] = [
  { id: -1, text: 'why', category: 'adverb', language: 'fr', translation: null },
  { id: -2, text: 'use', category: 'verb', language: 'fr', translation: null },
  { id: -3, text: 'many', category: 'adjective', language: 'fr', translation: null },
  { id: -4, text: 'word', category: 'noun', language: 'fr', translation: null },
  { id: -5, text: 'when', category: 'conjunction', language: 'fr', translation: null },
  { id: -6, text: 'few', category: 'adjective', language: 'fr', translation: null },
  { id: -7, text: 'word', category: 'noun', language: 'fr', translation: null },
  { id: -8, text: 'do', category: 'verb', language: 'fr', translation: null },
  { id: -9, text: 'trick', category: 'noun', language: 'fr', translation: null },
]

export function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">About</h1>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to Sandbox
        </Link>
      </div>

      <div className="flex max-w-prose flex-col gap-4 text-left text-foreground">
        <div className="flex flex-wrap gap-1">
          {titleWords.map((word, index) => (
            <WordBadge key={index} word={word} className="px-2 py-0.5 pb-1 text-xs" />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">— Kevin, The Office</p>
        <p>
          This is a practise space for playing with a language and building sentences out of
          words you're still learning.
        </p>
        <p>
          Most language tools start with grammar and correct you along the way. This one starts
          with <strong>word recognition</strong> instead: drag words you know into a sentence and
          see what you can say with them, before worrying about whether it's "right."
        </p>
        <p>There's no correction tool here, and that's on purpose (for now, at least).</p>
      </div>
    </div>
  )
}
