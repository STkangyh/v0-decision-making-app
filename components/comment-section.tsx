'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { checkProfanity } from '@/lib/moderate'
import { toast } from 'sonner'
import { MessageCircle, Send, Trash2, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Comment } from '@/lib/types'

interface CommentSectionProps {
  decisionId: string
}

async function fetchComments(decisionId: string): Promise<Comment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('decision_id', decisionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export function CommentSection({ decisionId }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profanityError, setProfanityError] = useState<string[] | null>(null)
  const sessionId = typeof window !== 'undefined' ? getSessionId() : ''

  const { data: comments, isLoading } = useSWR(
    ['comments', decisionId],
    () => fetchComments(decisionId),
    { refreshInterval: 5000 }
  )

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (profanityError) setProfanityError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setProfanityError(null)

    try {
      const { blocked, words } = await checkProfanity(content.trim())
      if (blocked) {
        setProfanityError(words)
        return
      }

      const supabase = createClient()

      const { error } = await supabase.from('comments').insert({
        decision_id: decisionId,
        session_id: sessionId,
        content: content.trim(),
      })

      if (error) throw error

      setContent('')
      mutate(['comments', decisionId])
      toast.success('의견이 등록되었습니다!')
    } catch {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('session_id', sessionId)

      if (error) throw error

      mutate(['comments', decisionId])
      toast.success('의견이 삭제되었습니다.')
    } catch {
      toast.error('삭제에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-foreground">
        <MessageCircle className="h-5 w-5 text-primary" />
        의견 나누기
      </h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <Textarea
            placeholder="당신의 의견을 남겨주세요..."
            value={content}
            onChange={handleContentChange}
            rows={2}
            maxLength={500}
            className={cn(
              'flex-1 resize-none transition-colors',
              profanityError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!content.trim() || isSubmitting}
            className="h-auto"
          >
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* 인라인 비속어 경고 */}
        {profanityError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">부적절한 표현이 포함되어 있습니다</p>
              <p className="text-destructive/80">
                커뮤니티 가이드라인에 맞게 수정 후 다시 시도해 주세요.
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {profanityError.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block rounded bg-destructive/15 px-1.5 py-0.5 text-xs font-mono font-semibold"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {!isLoading && comments?.length === 0 && (
        <Empty
          icon={MessageCircle}
          title="아직 의견이 없어요"
          description="첫 번째 의견을 남겨보세요!"
          className="py-8"
        />
      )}

      {!isLoading && comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm text-foreground">{comment.content}</p>
                {comment.session_id === sessionId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(new Date(comment.created_at))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
