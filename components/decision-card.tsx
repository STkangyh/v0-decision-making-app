'use client'

import { useState, useEffect, useRef } from 'react'
import { mutate } from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Users, CheckCircle2, Clock, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchVoteForSession, insertVote } from '@/lib/supabase/votes'
import { getSessionId } from '@/lib/session'
import { CATEGORY_EMOJIS, type Category, type Decision } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DecisionCardProps {
  decision: Decision
  commentCount?: number
}

export function DecisionCard({ decision, commentCount = 0 }: DecisionCardProps) {
  const [votedOption, setVotedOption] = useState<'A' | 'B' | null>(null)
  const [localVotesA, setLocalVotesA] = useState(decision.votes_a)
  const [localVotesB, setLocalVotesB] = useState(decision.votes_b)
  const voteInFlight = useRef(false)
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
  const percentA = totalVotes > 0 ? Math.round((localVotesA / totalVotes) * 100) : 0
  const percentB = totalVotes > 0 ? Math.round((localVotesB / totalVotes) * 100) : 0

  useEffect(() => {
    setLocalVotesA(decision.votes_a)
    setLocalVotesB(decision.votes_b)
  }, [decision.votes_a, decision.votes_b])

  useEffect(() => {
    const checkExistingVote = async () => {
      const sessionId = getSessionId()
      if (!sessionId) return

      const supabase = createClient()
      const existing = await fetchVoteForSession(supabase, decision.id, sessionId)
      if (existing) setVotedOption(existing)
    }

    checkExistingVote()
  }, [decision.id])

  const handleVote = async (option: 'A' | 'B') => {
    if (votedOption || isClosed || voteInFlight.current) return

    voteInFlight.current = true
    const sessionId = getSessionId()
    const prevA = localVotesA
    const prevB = localVotesB

    setVotedOption(option)
    if (option === 'A') setLocalVotesA((p) => p + 1)
    else setLocalVotesB((p) => p + 1)

    try {
      const supabase = createClient()
      const { error: voteError } = await insertVote(supabase, {
        decisionId: decision.id,
        sessionId,
        option,
      })

      if (voteError) {
        setVotedOption(null)
        setLocalVotesA(prevA)
        setLocalVotesB(prevB)
        if (voteError.code === '23505') {
          toast.error('이미 투표하셨습니다!')
          void fetchVoteForSession(supabase, decision.id, sessionId).then((existing) => {
            if (existing) setVotedOption(existing)
          })
        } else {
          console.error('vote insert', voteError)
          toast.error(voteError.message || '투표에 실패했습니다.')
        }
        return
      }

      void mutate(
        (key) => Array.isArray(key) && key[0] === 'decisions',
        undefined,
        { revalidate: true },
      )
      toast.success('투표 완료!')
    } catch {
      setVotedOption(null)
      setLocalVotesA(prevA)
      setLocalVotesB(prevB)
      toast.error('투표에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      voteInFlight.current = false
    }
  }

  const timeAgo = getTimeAgo(new Date(decision.created_at))

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                {CATEGORY_EMOJIS[decision.category as Category]} {decision.category}
              </Badge>
              {isClosed && (
                <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  마감됨
                </Badge>
              )}
              {!isClosed && remainingTime && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Timer className="h-3 w-3" />
                  {remainingTime}
                </Badge>
              )}
            </div>
            <Link href={`/decision/${decision.id}`}>
              <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground hover:text-primary">
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
          <button
            type="button"
            onClick={() => handleVote('A')}
            disabled={!!votedOption || isClosed}
            className={cn(
              'relative w-full overflow-hidden rounded-lg border p-3 text-left transition-[border-color,box-shadow,background-color] duration-300 ease-out',
              votedOption === 'A'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              (votedOption || isClosed) && 'cursor-default'
            )}
          >
            {(votedOption || isClosed) && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 bg-primary/10 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${percentA}%` }}
              />
            )}
            <div className="relative z-[1] flex items-center justify-between">
              <span className="font-medium">{decision.option_a}</span>
              {(votedOption || isClosed) && (
                <span className="text-sm font-semibold text-primary transition-opacity duration-200">
                  {percentA}%
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleVote('B')}
            disabled={!!votedOption || isClosed}
            className={cn(
              'relative w-full overflow-hidden rounded-lg border p-3 text-left transition-[border-color,box-shadow,background-color] duration-300 ease-out',
              votedOption === 'B'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              (votedOption || isClosed) && 'cursor-default'
            )}
          >
            {(votedOption || isClosed) && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 bg-primary/10 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${percentB}%` }}
              />
            )}
            <div className="relative z-[1] flex items-center justify-between">
              <span className="font-medium">{decision.option_b}</span>
              {(votedOption || isClosed) && (
                <span className="text-sm font-semibold text-primary transition-opacity duration-200">
                  {percentB}%
                </span>
              )}
            </div>
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalVotes}명 참여
          </span>
          <Link
            href={`/decision/${decision.id}`}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount}개 의견
          </Link>
        </div>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {timeAgo}
        </span>
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
