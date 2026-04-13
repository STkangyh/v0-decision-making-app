'use client'

import { CATEGORIES, type Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  ForkKnife, TShirt, GameController, BookOpen, Heart, Trophy, Handshake, Star, Sparkle,
} from '@phosphor-icons/react'

interface CategoryFilterProps {
  selected: Category | null
  onSelect: (category: Category | null) => void
}

const CATEGORY_META: Record<Category, { icon: React.ElementType; active: string; idle: string }> = {
  '음식':  { icon: ForkKnife,      active: 'bg-orange-500 text-white border-orange-500', idle: 'bg-orange-200 text-orange-500 border-orange-200 hover:bg-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
  '패션':  { icon: TShirt,         active: 'bg-orange-400 text-white border-orange-400', idle: 'bg-orange-100 text-orange-400 border-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
  '여가':  { icon: GameController, active: 'bg-orange-500 text-white border-orange-500', idle: 'bg-orange-200 text-orange-500 border-orange-200 hover:bg-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
  '공부':  { icon: BookOpen,       active: 'bg-orange-600 text-white border-orange-600', idle: 'bg-orange-200 text-orange-600 border-orange-200 hover:bg-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700' },
  '연애':  { icon: Heart,          active: 'bg-orange-500 text-white border-orange-500', idle: 'bg-orange-100 text-orange-500 border-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
  '스포츠':{ icon: Trophy,         active: 'bg-orange-600 text-white border-orange-600', idle: 'bg-orange-200 text-orange-600 border-orange-200 hover:bg-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
  '친구':  { icon: Handshake,      active: 'bg-orange-600 text-white border-orange-600', idle: 'bg-amber-100  text-orange-600 border-amber-100  hover:bg-amber-200  dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
  '기타':  { icon: Star,           active: 'bg-orange-400 text-white border-orange-400', idle: 'bg-orange-50  text-orange-400 border-orange-50  hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700' },
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
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all duration-200',
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
