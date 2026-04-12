'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Users, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  const [isVoting, setIsVoting] = useState(false)

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
    if (votedOption || decision.is_closed || isVoting) return

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
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                {CATEGORY_EMOJIS[decision.category as Category]} {decision.category}
              </Badge>
              {decision.is_closed && (
                <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  마감됨
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
            onClick={() => handleVote('A')}
            disabled={!!votedOption || decision.is_closed || isVoting}
            className={cn(
              'relative w-full overflow-hidden rounded-lg border p-3 text-left transition-all',
              votedOption === 'A'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              (votedOption || decision.is_closed) && 'cursor-default'
            )}
          >
            {(votedOption || decision.is_closed) && (
              <div
                className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500"
                style={{ width: `${percentA}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-medium">{decision.option_a}</span>
              {(votedOption || decision.is_closed) && (
                <span className="text-sm font-semibold text-primary">{percentA}%</span>
              )}
            </div>
          </button>

          <button
            onClick={() => handleVote('B')}
            disabled={!!votedOption || decision.is_closed || isVoting}
            className={cn(
              'relative w-full overflow-hidden rounded-lg border p-3 text-left transition-all',
              votedOption === 'B'
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent/50',
              (votedOption || decision.is_closed) && 'cursor-default'
            )}
          >
            {(votedOption || decision.is_closed) && (
              <div
                className="absolute inset-y-0 left-0 bg-accent/20 transition-all duration-500"
                style={{ width: `${percentB}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-medium">{decision.option_b}</span>
              {(votedOption || decision.is_closed) && (
                <span className="text-sm font-semibold text-accent-foreground">{percentB}%</span>
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
