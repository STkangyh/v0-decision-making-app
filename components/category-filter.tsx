'use client'

import { Button } from '@/components/ui/button'
import { CATEGORIES, CATEGORY_EMOJIS, type Category } from '@/lib/types'

interface CategoryFilterProps {
  selected: Category | null
  onSelect: (category: Category | null) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(null)}
        className="rounded-full"
      >
        전체
      </Button>
      {CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={selected === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(category)}
          className="gap-1.5 rounded-full"
        >
          <span>{CATEGORY_EMOJIS[category]}</span>
          {category}
        </Button>
      ))}
    </div>
  )
}
