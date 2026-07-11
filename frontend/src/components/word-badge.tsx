import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Word } from '@/types/word'

const wordBadgeVariants = cva(
  'rounded-full border-2 border-transparent px-3.5 py-1.5 text-sm font-semibold tracking-wide shadow-sm transition-transform duration-150 cursor-default hover:-translate-y-0.5 hover:shadow-md',
  {
    variants: {
      category: {
        noun: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
        verb: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200',
        adjective: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
        adverb: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
        pronoun: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200',
        preposition: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200',
        conjunction: 'bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-200',
        article: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
        interjection: 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200',
        other: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200',
      },
    },
    defaultVariants: {
      category: 'other',
    },
  },
)

export interface WordBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, 'variant' | 'children'>,
    VariantProps<typeof wordBadgeVariants> {
  word: Word
}

export function WordBadge({ word, category, className, ...props }: WordBadgeProps) {
  return (
    <Badge
      title={word.translation}
      className={cn(wordBadgeVariants({ category: category ?? word.category }), className)}
      {...props}
    >
      {word.text}
    </Badge>
  )
}
