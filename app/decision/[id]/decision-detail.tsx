'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { CommentSection } from '@/components/comment-section'
import { ShareButton } from '@/components/share-button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Category, type Decision } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  ForkKnife, TShirt, GameController, BookOpen, Heart, Star,
  ArrowLeft, CheckCircle, UsersThree, Clock, Trash, Lock, Timer,
} from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { toast } from 'sonner'

const CATEGORY_META: Record<Category, { color: string; icon: React.ElementType }> = {
  '음식': { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300', icon: ForkKnife },
  '패션': { color: 'bg-pink-100   text-pink-600   dark:bg-pink-900/40   dark:text-pink-300',   icon: TShirt },
  '여가': { color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300', icon: GameController },
  '공부': { color: 'bg-blue-100   text-blue-600   dark:bg-blue-900/40   dark:text-blue-300',   icon: BookOpen },
  '연애': { color: 'bg-rose-100   text-rose-600   dark:bg-rose-900/40   dark:text-rose-300',   icon: Heart },
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


interface DecisionDetailProps {
  decision: Decision
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

export function DecisionDetail({ decision: initialDecision }: DecisionDetailProps) {
  const router = useRouter()
  const [decision, setDecision] = useState(initialDecision)
  const [votedOption, setVotedOption] = useState<'A' | 'B' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [remainingTime, setRemainingTime] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  // author_session_id가 null인 레거시 글은 누구나 관리 가능
  // author_session_id가 있는 신규 글은 작성자 본인만 관리 가능
  const isAuthor = !decision.author_session_id || decision.author_session_id === sessionId

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

  const totalVotes = decision.votes_a + decision.votes_b
  const percentA = totalVotes > 0 ? Math.round((decision.votes_a / totalVotes) * 100) : 50
  const percentB = totalVotes > 0 ? Math.round((decision.votes_b / totalVotes) * 100) : 50
  const winningOption = decision.votes_a > decision.votes_b ? 'A' : decision.votes_b > decision.votes_a ? 'B' : null

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

      setDecision((prev) => ({
        ...prev,
        votes_a: option === 'A' ? prev.votes_a + 1 : prev.votes_a,
        votes_b: option === 'B' ? prev.votes_b + 1 : prev.votes_b,
      }))
      setVotedOption(option)
      toast.success('투표 완료!')
    } catch {
      toast.error('투표에 실패했습니다.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleClose = async () => {
    if (isClosed || isClosing) return

    setIsClosing(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('decisions')
        .update({ is_closed: true })
        .eq('id', decision.id)

      if (error) throw error

      setDecision((prev) => ({ ...prev, is_closed: true }))
      toast.success('투표가 마감되었습니다!')
    } catch {
      toast.error('마감에 실패했습니다.')
    } finally {
      setIsClosing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from('decisions').delete().eq('id', decision.id)

      if (error) throw error

      toast.success('결정 요청이 삭제되었습니다.')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
          목록으로
        </Link>

        <Card className="mb-6 glass-card rounded-2xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <CategoryBadge category={decision.category as Category} />
                  {isClosed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <CheckCircle weight="fill" className="h-3 w-3" />
                      마감됨
                    </span>
                  )}
                  {!isClosed && remainingTime && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                      <Timer weight="fill" className="h-3 w-3" />
                      {remainingTime}
                    </span>
                  )}
                </div>
                <h1 className="text-balance text-xl font-extrabold text-foreground sm:text-2xl">
                  {decision.title}
                </h1>
                {decision.description && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{decision.description}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <UsersThree weight="fill" className="h-4 w-4 text-primary/60" />
                <span className="font-medium text-foreground">{totalVotes}명</span> 참여
              </span>
              <span className="flex items-center gap-1">
                <Clock weight="fill" className="h-4 w-4 text-primary/60" />
                {new Date(decision.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 투표 선택지 */}
            <div className="space-y-2">
              {/* A — 인디고 */}
              <button
                onClick={() => handleVote('A')}
                disabled={!!votedOption || isClosed || isVoting}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200',
                  votedOption === 'A'
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : isClosed && winningOption === 'A'
                      ? 'border-primary/50 bg-primary/3'
                      : 'border-border/60 bg-slate-50/50 hover:border-primary/50 hover:bg-primary/3',
                  (votedOption || isClosed) ? 'cursor-default' : 'hover:scale-[1.005]'
                )}
              >
                {(votedOption || isClosed) && (
                  <div className="absolute inset-y-0 left-0 vote-a-bar transition-all duration-700" style={{ width: `${percentA}%` }} />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="text-base font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-extrabold text-primary">A</span>
                    {decision.option_a}
                  </span>
                  {(votedOption || isClosed) && (
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-primary">{percentA}%</div>
                      <div className="text-xs text-muted-foreground">{decision.votes_a}표</div>
                    </div>
                  )}
                </div>
                {votedOption === 'A' && (
                  <p className="relative mt-1 text-xs font-medium text-primary">✓ 내가 선택했어요</p>
                )}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs font-extrabold text-muted-foreground tracking-wider">VS</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* B — 코랄 */}
              <button
                onClick={() => handleVote('B')}
                disabled={!!votedOption || isClosed || isVoting}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200',
                  votedOption === 'B'
                    ? 'border-accent bg-accent/5 shadow-md shadow-accent/10'
                    : isClosed && winningOption === 'B'
                      ? 'border-accent/50 bg-accent/3'
                      : 'border-border/60 bg-slate-50/50 hover:border-accent/50 hover:bg-accent/3',
                  (votedOption || isClosed) ? 'cursor-default' : 'hover:scale-[1.005]'
                )}
              >
                {(votedOption || isClosed) && (
                  <div className="absolute inset-y-0 left-0 vote-b-bar transition-all duration-700" style={{ width: `${percentB}%` }} />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="text-base font-bold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs font-extrabold text-accent">B</span>
                    {decision.option_b}
                  </span>
                  {(votedOption || isClosed) && (
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-accent">{percentB}%</div>
                      <div className="text-xs text-muted-foreground">{decision.votes_b}표</div>
                    </div>
                  )}
                </div>
                {votedOption === 'B' && (
                  <p className="relative mt-1 text-xs font-medium text-accent">✓ 내가 선택했어요</p>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/30 dark:border-white/10 pt-4">
              <div className="flex flex-wrap gap-2">
                {isAuthor && !isClosed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    disabled={isClosing}
                    className="gap-1.5"
                  >
                    {isClosing ? <Spinner className="h-4 w-4" /> : <Lock weight="fill" className="h-4 w-4" />}
                    투표 마감
                  </Button>
                )}

                {isAuthor && (
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash weight="fill" className="h-4 w-4" />
                        삭제
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>정말 삭제하시겠어요?</DialogTitle>
                        <DialogDescription>
                          이 결정 요청과 모든 투표, 댓글이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          취소
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                          삭제
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <ShareButton decisionId={decision.id} title={decision.title} />
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="glass-card rounded-2xl border-0">
          <CardContent className="pt-6">
            <CommentSection decisionId={decision.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
