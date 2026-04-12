'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { DecisionCard } from './decision-card'
import { CategoryFilter } from './category-filter'
import { Empty } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import type { Category, Decision } from '@/lib/types'
import { Question } from '@phosphor-icons/react'

interface DecisionWithComments extends Decision {
  comment_count: number
}

async function fetchDecisions(category: Category | null): Promise<DecisionWithComments[]> {
  const supabase = createClient()

  let query = supabase
    .from('decisions')
    .select('*, comments(count)')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map((d) => ({
    ...d,
    comment_count: d.comments?.[0]?.count || 0,
  }))
}

export function DecisionList() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const { data: decisions, isLoading, error } = useSWR(
    ['decisions', selectedCategory],
    () => fetchDecisions(selectedCategory),
    { refreshInterval: 10000 }
  )

  return (
    <div className="space-y-6">
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
          데이터를 불러오는데 실패했습니다. 다시 시도해 주세요.
        </div>
      )}

      {!isLoading && !error && decisions?.length === 0 && (
        <Empty
          icon={Question}
          title="아직 결정 요청이 없어요"
          description="첫 번째 결정 요청을 올려보세요!"
        />
      )}

      {!isLoading && !error && decisions && decisions.length > 0 && (
        <div className="space-y-4">
          {decisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              commentCount={decision.comment_count}
            />
          ))}
        </div>
      )}
    </div>
  )
}
