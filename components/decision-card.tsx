'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { MessageCircle, Users, CheckCircle2, Clock, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { CATEGORY_EMOJIS, type Category, type Decision } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/share-button'

const CATEGORY_BADGE: Record<Category, string> = {
  '음식': 'bg-orange-100 text-orange-600',
  '패션': 'bg-pink-100 text-pink-600',
  '여가': 'bg-violet-100 text-violet-600',
  '공부': 'bg-blue-100 text-blue-600',
  '연애': 'bg-rose-100 text-rose-600',
  '기타': 'bg-slate-100 text-slate-600',
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', CATEGORY_BADGE[category])}>
      {CATEGORY_EMOJIS[category]} {category}
    </span>
  )
}

interface DecisionCardProps {
  decision: Decision
  commentCount?: number
}

export function DecisionCard({ decision, commentCount = 0 }: DecisionCardProps) {
  const [votedOption, setVotedOption] = useState<'A' | 'B' | null>(null)
  const [localVotesA, setLocalVotesA] = useState(decision.votes_a)
  const [localVotesB, setLocalVotesB] = useState(decision.votes_b)
  const [isVoting, setIsVoting] = useState(false)
  const [remainingTime, setRemainingTime] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  // Check if deadline has passed
  useEffect(() => {
    if (!decision.deadline) return

    const checkDeadline = () => {
      const now = new Date()
      const deadline = new Date(decision.deadline!)
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setIsExpired(true)
        setRemainingTime(null)
      } else {
        setIsExpired(false)
        setRemainingTime(formatRemainingTime(diff))
      }
    }

    checkDeadline()
    const interval = setInterval(checkDeadline, 1000)
    return () => clearInterval(interval)
  }, [decision.deadline])

  const isClosed = decision.is_closed || isExpired

  const totalVotes = localVotesA + localVotesB
  const percentA = totalVotes > 0 ? Math.round((localVotesA / totalVotes) * 100) : 50
  const percentB = totalVotes > 0 ? Math.round((localVotesB / totalVotes) * 100) : 50

  useEffect(() => {
    const checkExistingVote = async () => {
      const sessionId = getSessionId()
      if (!sessionId) return

      const supabase = createClient()
      const { data } = await supabase
        .from('votes')
        .select('selected_option')
        .eq('decision_id', decision.id)
        .eq('session_id', sessionId)
        .single()

      if (data) {
        setVotedOption(data.selected_option)
      }
    }

    checkExistingVote()
  }, [decision.id])

  const handleVote = async (option: 'A' | 'B') => {
    if (votedOption || isClosed || isVoting) return

    setIsVoting(true)
    const sessionId = getSessionId()

    try {
      const supabase = createClient()
      
      const { error: voteError } = await supabase.from('votes').insert({
        decision_id: decision.id,
        session_id: sessionId,
        selected_option: option,
      })

      if (voteError) {
        if (voteError.code === '23505') {
          toast.error('이미 투표하셨습니다!')
        } else {
          throw voteError
        }
        return
      }

      // Update local state
      if (option === 'A') {
        setLocalVotesA((prev) => prev + 1)
      } else {
        setLocalVotesB((prev) => prev + 1)
      }
      setVotedOption(option)
      toast.success('투표 완료!')
    } catch {
      toast.error('투표에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsVoting(false)
    }
  }

  const timeAgo = getTimeAgo(new Date(decision.created_at))

  return (
    <Card className="overflow-hidden border-border/60 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/8 card-glow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={decision.category as Category} />
              {isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  <CheckCircle2 className="h-3 w-3" />
                  마감됨
                </span>
              )}
              {!isClosed && remainingTime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                  <Timer className="h-3 w-3" />
                  {remainingTime}
                </span>
              )}
            </div>
            <Link href={`/decision/${decision.id}`}>
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground hover:text-primary transition-colors">
                {decision.title}
              </h3>
            </Link>
            {decision.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {decision.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {/* 선택지 A — 인디고 */}
          <button
            onClick={() => handleVote('A')}
            disabled={!!votedOption || isClosed || isVoting}
            className={cn(
              'relative w-full overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-200',
              votedOption === 'A'
                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                : isClosed && localVotesA >= localVotesB && localVotesA > 0
                  ? 'border-primary/40 bg-primary/3'
                  : 'border-border/60 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/3',
              (votedOption || isClosed) ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'
            )}
          >
            {(votedOption || isClosed) && (
              <div
                className="absolute inset-y-0 left-0 vote-a-bar transition-all duration-700"
                style={{ width: `${percentA}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-semibold text-sm">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">A</span>
                {decision.option_a}
              </span>
              {(votedOption || isClosed) && (
                <span className="text-sm font-bold text-primary">{percentA}%</span>
              )}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* 선택지 B — 코랄 */}
          <button
            onClick={() => handleVote('B')}
            disabled={!!votedOption || isClosed || isVoting}
            className={cn(
              'relative w-full overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-200',
              votedOption === 'B'
                ? 'border-accent bg-accent/5 shadow-sm shadow-accent/10'
                : isClosed && localVotesB > localVotesA
                  ? 'border-accent/40 bg-accent/3'
                  : 'border-border/60 bg-slate-50/50 hover:border-accent/40 hover:bg-accent/3',
              (votedOption || isClosed) ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'
            )}
          >
            {(votedOption || isClosed) && (
              <div
                className="absolute inset-y-0 left-0 vote-b-bar transition-all duration-700"
                style={{ width: `${percentB}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-semibold text-sm">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">B</span>
                {decision.option_b}
              </span>
              {(votedOption || isClosed) && (
                <span className="text-sm font-bold text-accent">{percentB}%</span>
              )}
            </div>
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-gradient-to-r from-primary/3 to-accent/3 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium">{totalVotes}명</span> 참여
          </span>
          <Link
            href={`/decision/${decision.id}`}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {commentCount}개 의견
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </span>
          <ShareButton decisionId={decision.id} title={decision.title} variant="icon" />
        </div>
      </CardFooter>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
  return date.toLocaleDateString('ko-KR')
}

function formatRemainingTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}시간 ${remainingMinutes}분 남음`
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}분 ${remainingSeconds}초 남음`
  }
  return `${seconds}초 남음`
}
