'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Trophy, X, Crown, ArrowRight, UsersThree, Fire } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Decision } from '@/lib/types'

type RankedDecision = Decision & { total: number }

async function fetchTop3(): Promise<RankedDecision[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('decisions')
    .select('*')
    .limit(50)

  if (!data) return []

  return data
    .map((d) => ({ ...d, total: d.votes_a + d.votes_b }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
}

const RANK_META = [
  { emoji: '🥇', label: '1위', ring: 'ring-yellow-400/60', bg: 'bg-yellow-50 dark:bg-yellow-900/20', badge: 'bg-yellow-400 text-white' },
  { emoji: '🥈', label: '2위', ring: 'ring-slate-400/60',  bg: 'bg-slate-50 dark:bg-slate-800/30',   badge: 'bg-slate-400 text-white' },
  { emoji: '🥉', label: '3위', ring: 'ring-orange-400/60', bg: 'bg-orange-50 dark:bg-orange-900/20', badge: 'bg-orange-400 text-white' },
]

export function Top3Popup() {
  const [open, setOpen] = useState(false)

  const { data: top3, isLoading } = useSWR(
    open ? 'top3' : null,
    fetchTop3,
    { revalidateOnFocus: false }
  )

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-36 z-40',
          'flex items-center gap-2 rounded-full px-4 py-3',
          'bg-orange-400 shadow-lg',
          'text-white font-bold text-sm',
          'hover:scale-105 active:scale-95 transition-transform duration-200',
          'animate-pulse-slow'
        )}
        style={{ animationDuration: '3s' }}
      >
        <Trophy weight="fill" className="h-5 w-5 text-yellow-200" />
        <span>TOP 3</span>
        <Fire weight="fill" className="h-4 w-4 text-orange-200" />
      </button>

      {/* 모달 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* 블러 배경 */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* 팝업 카드 */}
          <div className="relative w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl">
            {/* 헤더 */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-gradient shadow-md">
                  <Crown weight="fill" className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold gradient-text">인기 투표 TOP 3</h2>
                  <p className="text-xs text-muted-foreground">지금 가장 뜨거운 고민들</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full glass text-muted-foreground hover:text-foreground transition-colors"
              >
                <X weight="bold" className="h-4 w-4" />
              </button>
            </div>

            {/* 목록 */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}

            {!isLoading && (!top3 || top3.length === 0) && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                아직 투표 데이터가 없어요 😅
              </div>
            )}

            {!isLoading && top3 && top3.length > 0 && (
              <div className="space-y-3">
                {top3.map((decision, i) => {
                  const rank = RANK_META[i]
                  const percentA = Math.round((decision.votes_a / decision.total) * 100)
                  const percentB = 100 - percentA
                  const winner = decision.votes_a >= decision.votes_b ? decision.option_a : decision.option_b
                  const winnerPct = decision.votes_a >= decision.votes_b ? percentA : percentB

                  return (
                    <Link
                      key={decision.id}
                      href={`/decision/${decision.id}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'group block rounded-2xl p-4 ring-2 transition-all hover:scale-[1.02]',
                        rank.ring, rank.bg
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* 순위 뱃지 */}
                        <span className="text-2xl leading-none mt-0.5 shrink-0">{rank.emoji}</span>

                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1 text-sm font-bold text-foreground">
                            {decision.title}
                          </p>

                          {/* 우세 선택지 */}
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            현재 우세: <span className="font-semibold text-primary">{winner}</span>
                            <span className="ml-1 text-primary/70">({winnerPct}%)</span>
                          </p>

                          {/* 미니 프로그레스 바 */}
                          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                            <div
                              className="h-full vote-a-bar transition-all duration-700"
                              style={{ width: `${percentA}%` }}
                            />
                          </div>
                          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                            <span>A {percentA}%</span>
                            <span className="font-semibold">
                              <UsersThree weight="fill" className="inline h-3 w-3 mr-0.5" />
                              {decision.total}명 참여
                            </span>
                            <span>B {percentB}%</span>
                          </div>
                        </div>

                        <ArrowRight weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              탭하면 해당 투표로 이동해요 👆
            </p>
          </div>
        </div>
      )}
    </>
  )
}
