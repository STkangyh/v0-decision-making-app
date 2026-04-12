'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { CATEGORIES, CATEGORY_EMOJIS, type Category, type Decision } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Clock,
  Edit,
  Trash2,
  Lock,
} from 'lucide-react'

interface DecisionDetailProps {
  decision: Decision
}

export function DecisionDetail({ decision: initialDecision }: DecisionDetailProps) {
  const router = useRouter()
  const [decision, setDecision] = useState(initialDecision)
  const [votedOption, setVotedOption] = useState<'A' | 'B' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(decision.title)
  const [editDescription, setEditDescription] = useState(decision.description || '')
  const [editOptionA, setEditOptionA] = useState(decision.option_a)
  const [editOptionB, setEditOptionB] = useState(decision.option_b)
  const [editCategory, setEditCategory] = useState<Category>(decision.category as Category)
  const [isUpdating, setIsUpdating] = useState(false)

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
    if (decision.is_closed || isClosing) return

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

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editOptionA.trim() || !editOptionB.trim()) return

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('decisions')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          option_a: editOptionA.trim(),
          option_b: editOptionB.trim(),
          category: editCategory,
        })
        .eq('id', decision.id)

      if (error) throw error

      setDecision((prev) => ({
        ...prev,
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        option_a: editOptionA.trim(),
        option_b: editOptionB.trim(),
        category: editCategory,
      }))
      setShowEditDialog(false)
      toast.success('수정되었습니다!')
    } catch {
      toast.error('수정에 실패했습니다.')
    } finally {
      setIsUpdating(false)
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
                  {decision.is_closed && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      마감됨
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
                onClick={() => handleVote('A')}
                disabled={!!votedOption || decision.is_closed || isVoting}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all',
                  votedOption === 'A'
                    ? 'border-primary bg-primary/5'
                    : decision.is_closed && winningOption === 'A'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50',
                  (votedOption || decision.is_closed) && 'cursor-default'
                )}
              >
                {(votedOption || decision.is_closed) && (
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-700"
                    style={{ width: `${percentA}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="text-lg font-semibold">{decision.option_a}</span>
                  {(votedOption || decision.is_closed) && (
                    <span className="text-xl font-bold text-primary">{percentA}%</span>
                  )}
                </div>
                {(votedOption || decision.is_closed) && (
                  <p className="relative mt-1 text-sm text-muted-foreground">
                    {decision.votes_a}표
                  </p>
                )}
              </button>

              <div className="text-center text-sm font-medium text-muted-foreground">VS</div>

              <button
                onClick={() => handleVote('B')}
                disabled={!!votedOption || decision.is_closed || isVoting}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all',
                  votedOption === 'B'
                    ? 'border-accent bg-accent/10'
                    : decision.is_closed && winningOption === 'B'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50',
                  (votedOption || decision.is_closed) && 'cursor-default'
                )}
              >
                {(votedOption || decision.is_closed) && (
                  <div
                    className="absolute inset-y-0 left-0 bg-accent/25 transition-all duration-700"
                    style={{ width: `${percentB}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="text-lg font-semibold">{decision.option_b}</span>
                  {(votedOption || decision.is_closed) && (
                    <span className="text-xl font-bold text-accent-foreground">{percentB}%</span>
                  )}
                </div>
                {(votedOption || decision.is_closed) && (
                  <p className="relative mt-1 text-sm text-muted-foreground">
                    {decision.votes_b}표
                  </p>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit className="h-4 w-4" />
                    수정
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>결정 요청 수정</DialogTitle>
                    <DialogDescription>내용을 수정해 주세요</DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="py-4">
                    <Field>
                      <FieldLabel>제목</FieldLabel>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={100}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>설명 (선택)</FieldLabel>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        maxLength={500}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>카테고리</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditCategory(cat)}
                            className={cn(
                              'rounded-full border px-3 py-1.5 text-sm transition-colors',
                              editCategory === cat
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary/50'
                            )}
                          >
                            {CATEGORY_EMOJIS[cat]} {cat}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>선택지 A</FieldLabel>
                        <Input
                          value={editOptionA}
                          onChange={(e) => setEditOptionA(e.target.value)}
                          maxLength={100}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>선택지 B</FieldLabel>
                        <Input
                          value={editOptionB}
                          onChange={(e) => setEditOptionB(e.target.value)}
                          maxLength={100}
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      취소
                    </Button>
                    <Button onClick={handleUpdate} disabled={isUpdating}>
                      {isUpdating ? <Spinner className="mr-2 h-4 w-4" /> : null}
                      저장
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {!decision.is_closed && (
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
