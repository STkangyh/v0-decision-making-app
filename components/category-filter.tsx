'use client'

import { CATEGORIES, CATEGORY_EMOJIS, type Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  selected: Category | null
  onSelect: (category: Category | null) => void
}

const CATEGORY_COLORS: Record<Category, string> = {
  '음식':  'bg-orange-100  text-orange-600  border-orange-200  hover:bg-orange-200',
  '패션':  'bg-pink-100    text-pink-600    border-pink-200    hover:bg-pink-200',
  '여가':  'bg-violet-100  text-violet-600  border-violet-200  hover:bg-violet-200',
  '공부':  'bg-blue-100    text-blue-600    border-blue-200    hover:bg-blue-200',
  '연애':  'bg-rose-100    text-rose-600    border-rose-200    hover:bg-rose-200',
  '기타':  'bg-slate-100   text-slate-600   border-slate-200   hover:bg-slate-200',
}

const CATEGORY_SELECTED: Record<Category, string> = {
  '음식':  'bg-orange-500  text-white border-orange-500',
  '패션':  'bg-pink-500    text-white border-pink-500',
  '여가':  'bg-violet-500  text-white border-violet-500',
  '공부':  'bg-blue-500    text-white border-blue-500',
  '연애':  'bg-rose-500    text-white border-rose-500',
  '기타':  'bg-slate-500   text-white border-slate-500',
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
          selected === null
            ? 'bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-sm'
            : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
        )}
      >
        ✨ 전체
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
            selected === category
              ? CATEGORY_SELECTED[category]
              : CATEGORY_COLORS[category]
          )}
        >
          {CATEGORY_EMOJIS[category]} {category}
        </button>
      ))}
    </div>
  )
}
