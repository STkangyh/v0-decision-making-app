'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { CommentSection } from '@/components/comment-section'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { fetchVoteForSession, insertVote } from '@/lib/supabase/votes'
import { getSessionId } from '@/lib/session'
import { CATEGORY_EMOJIS, type Category, type Decision } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Clock,
  Trash2,
  Lock,
  Timer,
} from 'lucide-react'

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
  const voteInFlight = useRef(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

  const totalVotes = decision.votes_a + decision.votes_b
  const percentA = totalVotes > 0 ? Math.round((decision.votes_a / totalVotes) * 100) : 0
  const percentB = totalVotes > 0 ? Math.round((decision.votes_b / totalVotes) * 100) : 0
  const winningOption = decision.votes_a > decision.votes_b ? 'A' : decision.votes_b > decision.votes_a ? 'B' : null

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

  useEffect(() => {
    if (voteInFlight.current) return
    setDecision((prev) => {
      if (
        prev.id === initialDecision.id &&
        prev.votes_a === initialDecision.votes_a &&
        prev.votes_b === initialDecision.votes_b &&
        prev.is_closed === initialDecision.is_closed
      ) {
        return prev
      }
      return initialDecision
    })
  }, [initialDecision])

  const handleVote = async (option: 'A' | 'B') => {
    if (votedOption || isClosed || voteInFlight.current) return

    voteInFlight.current = true
    const sessionId = getSessionId()
    const snapshot = { ...decision }

    setVotedOption(option)
    setDecision((prev) => ({
      ...prev,
      votes_a: option === 'A' ? prev.votes_a + 1 : prev.votes_a,
      votes_b: option === 'B' ? prev.votes_b + 1 : prev.votes_b,
    }))

    try {
      const supabase = createClient()

      const { error: voteError } = await insertVote(supabase, {
        decisionId: decision.id,
        sessionId,
        option,
      })

      if (voteError) {
        setDecision(snapshot)
        setVotedOption(null)
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

      startTransition(() => {
        router.refresh()
      })
      toast.success('투표 완료!')
    } catch {
      setDecision(snapshot)
      setVotedOption(null)
      toast.error('투표에 실패했습니다.')
    } finally {
      voteInFlight.current = false
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    {CATEGORY_EMOJIS[decision.category as Category]} {decision.category}
                  </Badge>
                  {isClosed && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      마감됨
                    </Badge>
                  )}
                  {!isClosed && remainingTime && (
                    <Badge variant="secondary" className="gap-1">
                      <Timer className="h-3 w-3" />
                      {remainingTime}
                    </Badge>
                  )}
                </div>
                <h1 className="text-balance text-xl font-bold text-foreground sm:text-2xl">
                  {decision.title}
                </h1>
                {decision.description && (
                  <p className="mt-2 text-muted-foreground">{decision.description}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {totalVotes}명 참여
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(decision.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Voting Options */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleVote('A')}
                disabled={!!votedOption || isClosed}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-[border-color,box-shadow,background-color] duration-300 ease-out',
                  votedOption === 'A'
                    ? 'border-primary bg-primary/5'
                    : isClosed && winningOption === 'A'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50',
                  (votedOption || isClosed) && 'cursor-default'
                )}
              >
                {(votedOption || isClosed) && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 bg-primary/15 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                    style={{ width: `${percentA}%` }}
                  />
                )}
                <div className="relative z-[1] flex items-center justify-between">
                  <span className="text-lg font-semibold">{decision.option_a}</span>
                  {(votedOption || isClosed) && (
                    <span className="text-xl font-bold text-primary transition-opacity duration-200">
                      {percentA}%
                    </span>
                  )}
                </div>
                {(votedOption || isClosed) && (
                  <p className="relative z-[1] mt-1 text-sm text-muted-foreground">
                    {decision.votes_a}표
                  </p>
                )}
              </button>

              <div className="text-center text-sm font-medium text-muted-foreground">VS</div>

              <button
                type="button"
                onClick={() => handleVote('B')}
                disabled={!!votedOption || isClosed}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-[border-color,box-shadow,background-color] duration-300 ease-out',
                  votedOption === 'B'
                    ? 'border-accent bg-accent/10'
                    : isClosed && winningOption === 'B'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50',
                  (votedOption || isClosed) && 'cursor-default'
                )}
              >
                {(votedOption || isClosed) && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 bg-accent/25 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                    style={{ width: `${percentB}%` }}
                  />
                )}
                <div className="relative z-[1] flex items-center justify-between">
                  <span className="text-lg font-semibold">{decision.option_b}</span>
                  {(votedOption || isClosed) && (
                    <span className="text-xl font-bold text-accent-foreground transition-opacity duration-200">
                      {percentB}%
                    </span>
                  )}
                </div>
                {(votedOption || isClosed) && (
                  <p className="relative z-[1] mt-1 text-sm text-muted-foreground">
                    {decision.votes_b}표
                  </p>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              {!isClosed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={isClosing}
                  className="gap-1.5"
                >
                  {isClosing ? <Spinner className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  투표 마감
                </Button>
              )}

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="h-4 w-4" />
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
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="pt-6">
            <CommentSection decisionId={decision.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
