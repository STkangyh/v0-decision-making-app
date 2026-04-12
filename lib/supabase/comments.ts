import type { SupabaseClient } from '@supabase/supabase-js'
import type { Comment } from '@/lib/types'

function isUnknownColumn(error: { message?: string; code?: string } | null, col: string): boolean {
  if (!error?.message) return false
  const m = error.message.toLowerCase()
  const c = col.toLowerCase()
  return m.includes(c) && (m.includes('column') || m.includes('schema') || error.code === 'PGRST204')
}

function shouldRetryCommentsWithCommenterId(error: { message?: string; code?: string } | null): boolean {
  if (!error?.message) return false
  const m = error.message.toLowerCase()
  if (isUnknownColumn(error, 'session_id')) return true
  if (error.code === '23502' && m.includes('commenter_id')) return true
  return false
}

function normalizeCommentRow(row: Record<string, unknown>): Comment {
  const sid = (row.session_id ?? row.commenter_id ?? '') as string
  return {
    id: row.id as string,
    decision_id: row.decision_id as string,
    session_id: sid,
    content: row.content as string,
    created_at: row.created_at as string,
  }
}

export async function fetchCommentsForDecision(
  supabase: SupabaseClient,
  decisionId: string,
): Promise<{ data: Comment[]; error: { message: string; code?: string } | null }> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('decision_id', decisionId)
    .order('created_at', { ascending: true })

  if (error) {
    return { data: [], error }
  }
  return {
    data: (data || []).map((row) => normalizeCommentRow(row as Record<string, unknown>)),
    error: null,
  }
}

const baseInsert = (decisionId: string, content: string) => ({
  decision_id: decisionId,
  content,
  author_nickname: '익명' as const,
})

export async function insertComment(
  supabase: SupabaseClient,
  params: { decisionId: string; sessionId: string; content: string },
): Promise<{ error: { message: string; code?: string } | null }> {
  const minimal = baseInsert(params.decisionId, params.content)

  let { error } = await supabase.from('comments').insert({
    ...minimal,
    session_id: params.sessionId,
  })

  if (!error) return { error: null }

  if (shouldRetryCommentsWithCommenterId(error)) {
    ;({ error } = await supabase.from('comments').insert({
      ...minimal,
      commenter_id: params.sessionId,
    }))
  }

  if (!error) return { error: null }

  if (isUnknownColumn(error, 'commenter_id') || isUnknownColumn(error, 'session_id')) {
    ;({ error } = await supabase.from('comments').insert(minimal))
  }

  return { error }
}

export async function deleteCommentForSession(
  supabase: SupabaseClient,
  params: { commentId: string; sessionId: string },
): Promise<{ error: { message: string; code?: string } | null }> {
  let { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', params.commentId)
    .eq('session_id', params.sessionId)

  if (!error) return { error: null }

  if (shouldRetryCommentsWithCommenterId(error) || isUnknownColumn(error, 'session_id')) {
    ;({ error } = await supabase
      .from('comments')
      .delete()
      .eq('id', params.commentId)
      .eq('commenter_id', params.sessionId))
  }

  return { error }
}
