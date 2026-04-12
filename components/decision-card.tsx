'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  ChatCircle, UsersThree, CheckCircle, Clock, Timer,
  ForkKnife, TShirt, GameController, BookOpen, Heart, Trophy, Handshake, Star,
  ThumbsUp, BookmarkSimple,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { type Category, type Decision } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/share-button'

const CATEGORY_META: Record<Category, { color: string; icon: React.ElementType }> = {
  '음식': { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300', icon: ForkKnife },
  '패션': { color: 'bg-pink-100   text-pink-600   dark:bg-pink-900/40   dark:text-pink-300',   icon: TShirt },
  '여가': { color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300', icon: GameController },
  '공부': { color: 'bg-blue-100   text-blue-600   dark:bg-blue-900/40   dark:text-blue-300',   icon: BookOpen },
  '연애': { color: 'bg-rose-100   text-rose-600   dark:bg-rose-900/40   dark:text-rose-300',   icon: Heart },
  '스포츠': { color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300',   icon: Trophy },
  '친구': { color: 'bg-amber-100  text-amber-600  dark:bg-amber-900/40  dark:text-amber-300',  icon: Handshake },
  '기타': { color: 'bg-slate-100  text-slate-600  dark:bg-slate-800/60  dark:text-slate-300',  icon: Star },
}

function CategoryBadge({ category }: { category: Category }) {
  const { color, icon: Icon } = CATEGORY_META[category]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', color)}>
      <Icon weight="fill" className="h-3 w-3" /> {category}
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
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Check if deadline has passed
  useEffect(() => {
    if (!decision.deadline) return
    const checkDeadline = () => {
      const diff = new Date(decision.deadline!).getTime() - Date.now()
      if (diff <= 0) { setIsExpired(true); setRemainingTime(null) }
      else { setIsExpired(false); setRemainingTime(formatRemainingTime(diff)) }
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
    const init = async () => {
      const sessionId = getSessionId()
      if (!sessionId) return
      const supabase = createClient()

      const [voteRes, likeRes, bookmarkRes, likeCountRes] = await Promise.all([
        supabase.from('votes').select('selected_option').eq('decision_id', decision.id).eq('session_id', sessionId).single(),
        supabase.from('likes').select('id').eq('decision_id', decision.id).eq('session_id', sessionId).single(),
        supabase.from('bookmarks').select('id').eq('decision_id', decision.id).eq('session_id', sessionId).single(),
        supabase.from('likes').select('id', { count: 'exact', head: true }).eq('decision_id', decision.id),
      ])

      if (voteRes.data) setVotedOption(voteRes.data.selected_option)
      setIsLiked(!!likeRes.data)
      setIsBookmarked(!!bookmarkRes.data)
      setLikeCount(likeCountRes.count ?? 0)
    }
    init()
  }, [decision.id])

  const handleVote = async (option: 'A' | 'B') => {
    if (votedOption || isClosed || isVoting) return
    setIsVoting(true)
    const sessionId = getSessionId()
    try {
      const supabase = createClient()
      const { error: voteError } = await supabase.from('votes').insert({
        decision_id: decision.id, session_id: sessionId, selected_option: option,
      })
      if (voteError) {
        if (voteError.code === '23505') toast.error('이미 투표하셨습니다!')
        else throw voteError
        return
      }
      if (option === 'A') setLocalVotesA((p) => p + 1)
      else setLocalVotesB((p) => p + 1)
      setVotedOption(option)
      toast.success('투표 완료!')
    } catch { toast.error('투표에 실패했습니다. 다시 시도해 주세요.') }
    finally { setIsVoting(false) }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    const sessionId = getSessionId()
    const supabase = createClient()
    if (isLiked) {
      await supabase.from('likes').delete().eq('decision_id', decision.id).eq('session_id', sessionId)
      setIsLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('likes').insert({ decision_id: decision.id, session_id: sessionId })
      setIsLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    const sessionId = getSessionId()
    const supabase = createClient()
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('decision_id', decision.id).eq('session_id', sessionId)
      setIsBookmarked(false)
      toast.success('즐겨찾기 해제')
    } else {
      await supabase.from('bookmarks').insert({ decision_id: decision.id, session_id: sessionId })
      setIsBookmarked(true)
      toast.success('즐겨찾기 추가!')
    }
  }

  const timeAgo = getTimeAgo(new Date(decision.created_at))

  return (
    <Card className="overflow-hidden glass-card rounded-2xl card-hover border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={decision.category as Category} />
              {isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <CheckCircle weight="fill" className="h-3 w-3" />마감됨
                </span>
              )}
              {!isClosed && remainingTime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                  <Timer weight="fill" className="h-3 w-3" />{remainingTime}
                </span>
              )}
            </div>
            <Link href={`/decision/${decision.id}`}>
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground hover:text-primary transition-colors">
                {decision.title}
              </h3>
            </Link>
            {decision.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{decision.description}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {/* 선택지 A */}
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
              <div className="absolute inset-y-0 left-0 vote-a-bar transition-all duration-700" style={{ width: `${percentA}%` }} />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-semibold text-sm">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">A</span>
                {decision.option_a}
              </span>
              {(votedOption || isClosed) && <span className="text-sm font-bold text-primary">{percentA}%</span>}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* 선택지 B */}
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
              <div className="absolute inset-y-0 left-0 vote-b-bar transition-all duration-700" style={{ width: `${percentB}%` }} />
            )}
            <div className="relative flex items-center justify-between">
              <span className="font-semibold text-sm">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">B</span>
                {decision.option_b}
              </span>
              {(votedOption || isClosed) && <span className="text-sm font-bold text-accent">{percentB}%</span>}
            </div>
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <UsersThree weight="fill" className="h-3.5 w-3.5 text-primary/60" />
            <span className="font-semibold text-foreground/70">{totalVotes}명</span> 참여
          </span>
          <Link href={`/decision/${decision.id}`} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ChatCircle weight="fill" className="h-3.5 w-3.5 text-primary/60" />
            {commentCount}개 의견
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Clock weight="fill" className="h-3.5 w-3.5" />
            {timeAgo}
          </span>
          {/* 좋아요 */}
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-0.5 transition-colors',
              isLiked ? 'text-rose-500' : 'hover:text-rose-400'
            )}
            title="좋아요"
          >
            <ThumbsUp weight={isLiked ? 'fill' : 'regular'} className="h-3.5 w-3.5" />
            {likeCount > 0 && <span className="text-[11px] font-semibold">{likeCount}</span>}
          </button>
          {/* 즐겨찾기 */}
          <button
            onClick={handleBookmark}
            className={cn(
              'transition-colors',
              isBookmarked ? 'text-amber-400' : 'hover:text-amber-400'
            )}
            title="즐겨찾기"
          >
            <BookmarkSimple weight={isBookmarked ? 'fill' : 'regular'} className="h-3.5 w-3.5" />
          </button>
          <ShareButton decisionId={decision.id} title={decision.title} variant="icon" />
        </div>
      </CardFooter>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
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
  if (hours > 0) return `${hours}시간 ${minutes % 60}분 남음`
  if (minutes > 0) return `${minutes}분 ${seconds % 60}초 남음`
  return `${seconds}초 남음`
}
