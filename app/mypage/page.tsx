'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/header'
import { DecisionCard } from '@/components/decision-card'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { useAuth } from '@/components/auth-provider'
import type { Decision } from '@/lib/types'
import {
  User, ListBullets, BookmarkSimple, ThumbsUp,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type Filter = 'my' | 'bookmarks' | 'likes'

async function fetchMyDecisions(sessionId: string): Promise<Decision[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('decisions')
    .select('*')
    .eq('author_session_id', sessionId)
    .order('created_at', { ascending: false })
  return data ?? []
}

async function fetchBookmarked(sessionId: string): Promise<Decision[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookmarks')
    .select('decision:decisions(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  return (data ?? []).map((b: { decision: Decision }) => b.decision).filter(Boolean)
}

async function fetchLiked(sessionId: string): Promise<Decision[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('likes')
    .select('decision:decisions(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  return (data ?? []).map((l: { decision: Decision }) => l.decision).filter(Boolean)
}

const FILTERS: { key: Filter; label: string; icon: React.ElementType }[] = [
  { key: 'my',        label: '내 글',    icon: ListBullets },
  { key: 'bookmarks', label: '즐겨찾기', icon: BookmarkSimple },
  { key: 'likes',     label: '좋아요',   icon: ThumbsUp },
]

const EMPTY_CONFIG: Record<Filter, { title: string; description: string }> = {
  my:        { title: '아직 올린 글이 없어요', description: '첫 번째 고민을 올려보세요!' },
  bookmarks: { title: '즐겨찾기한 글이 없어요', description: '마음에 드는 글을 저장해보세요!' },
  likes:     { title: '좋아요한 글이 없어요', description: '마음에 드는 글에 좋아요를 눌러보세요!' },
}

export default function MyPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<Filter>('my')
  const sessionId = typeof window !== 'undefined' ? getSessionId() : ''

  const fetcher = (f: Filter) => {
    if (f === 'my') return fetchMyDecisions(sessionId)
    if (f === 'bookmarks') return fetchBookmarked(sessionId)
    return fetchLiked(sessionId)
  }

  const { data: decisions, isLoading } = useSWR(
    sessionId ? ['mypage', filter, sessionId] : null,
    () => fetcher(filter),
    { refreshInterval: 10000 }
  )

  const emptyConfig = EMPTY_CONFIG[filter]

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">

        {/* 프로필 헤더 */}
        <div className="glass-card mb-6 rounded-3xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl btn-gradient shadow-lg">
              <User weight="fill" className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">마이페이지</p>
              <h1 className="text-xl font-extrabold gradient-text">{user?.username ?? '익명'}</h1>
            </div>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="mb-5 flex gap-2">
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200',
                filter === key
                  ? 'btn-gradient border-transparent shadow-sm'
                  : 'glass text-muted-foreground border-border hover:text-foreground hover:border-primary/40'
              )}
            >
              <Icon weight={filter === key ? 'fill' : 'regular'} className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* 목록 */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {!isLoading && decisions?.length === 0 && (
          <Empty
            icon={FILTERS.find(f => f.key === filter)!.icon}
            title={emptyConfig.title}
            description={emptyConfig.description}
            className="py-16"
          />
        )}

        {!isLoading && decisions && decisions.length > 0 && (
          <div className="space-y-4">
            {decisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
