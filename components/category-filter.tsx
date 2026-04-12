'use client'

import { CATEGORIES, type Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  ForkKnife, TShirt, GameController, BookOpen, Heart, Star, Sparkle,
} from '@phosphor-icons/react'

interface CategoryFilterProps {
  selected: Category | null
  onSelect: (category: Category | null) => void
}

const CATEGORY_META: Record<Category, { icon: React.ElementType; active: string; idle: string }> = {
  '음식': { icon: ForkKnife,      active: 'bg-orange-500 text-white border-orange-500', idle: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700' },
  '패션': { icon: TShirt,         active: 'bg-pink-500   text-white border-pink-500',   idle: 'bg-pink-50   text-pink-600   border-pink-200   hover:bg-pink-100   dark:bg-pink-900/30   dark:text-pink-300   dark:border-pink-700' },
  '여가': { icon: GameController, active: 'bg-violet-500 text-white border-violet-500', idle: 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700' },
  '공부': { icon: BookOpen,       active: 'bg-blue-500   text-white border-blue-500',   idle: 'bg-blue-50   text-blue-600   border-blue-200   hover:bg-blue-100   dark:bg-blue-900/30   dark:text-blue-300   dark:border-blue-700' },
  '연애': { icon: Heart,          active: 'bg-rose-500   text-white border-rose-500',   idle: 'bg-rose-50   text-rose-600   border-rose-200   hover:bg-rose-100   dark:bg-rose-900/30   dark:text-rose-300   dark:border-rose-700' },
  '기타': { icon: Star,           active: 'bg-slate-600  text-white border-slate-600',  idle: 'bg-slate-100 text-slate-600  border-slate-200  hover:bg-slate-200  dark:bg-slate-800/60  dark:text-slate-300  dark:border-slate-600' },
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
          selected === null
            ? 'btn-gradient border-transparent shadow-sm'
            : 'bg-white/70 dark:bg-white/10 text-muted-foreground border-border hover:text-foreground hover:border-primary/40 glass'
        )}
      >
        <Sparkle weight="fill" className="h-3.5 w-3.5" />
        전체
      </button>

      {CATEGORIES.map((cat) => {
        const { icon: Icon, active, idle } = CATEGORY_META[cat]
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
              selected === cat ? active : idle
            )}
          >
            <Icon weight="fill" className="h-3.5 w-3.5" />
            {cat}
          </button>
        )
      })}
    </div>
  )
}
