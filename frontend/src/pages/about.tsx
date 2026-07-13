import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">About</h1>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to Sandbox
        </Link>
      </div>

      <div className="flex flex-col gap-4 text-foreground">
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
        <p>
          The goal isn't sentence perfection — it's a space to ask yourself: how would I try to
          communicate this, with the limited knowledge I actually have? Communication trumps
          perfection, especially when communication is itself a big gesture.
        </p>
      </div>
    </div>
  )
}
