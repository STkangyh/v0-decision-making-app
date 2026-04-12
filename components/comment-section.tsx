'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { toast } from 'sonner'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
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
  const sessionId = typeof window !== 'undefined' ? getSessionId() : ''

  const { data: comments, isLoading } = useSWR(
    ['comments', decisionId],
    () => fetchComments(decisionId),
    { refreshInterval: 5000 }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    console.log('[v0] handleSubmit comment', { decisionId, sessionId, content: content.trim() })

    try {
      const supabase = createClient()

      const { data, error } = await supabase.from('comments').insert({
        decision_id: decisionId,
        session_id: sessionId,
        content: content.trim(),
      }).select()

      console.log('[v0] comment insert result', { data, error })

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

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="당신의 의견을 남겨주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="flex-1 resize-none"
          maxLength={500}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSubmitting}
          className="h-auto"
        >
          {isSubmitting ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
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
            <div
              key={comment.id}
              className="rounded-lg border bg-card p-3"
            >
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
