import { getSessionId } from '@/lib/session'
import { isPostedDecisionIdInBrowser } from '@/lib/my-posted-decisions'
import type { Decision } from '@/lib/types'

/**
 * 이 브라우저에서 글 주인으로 볼 수 있는지 (투표 마감 등).
 * Supabase `author_session_id` 또는 등록 시 localStorage 기록.
 */
export function isDecisionOwnerInBrowser(decision: Pick<Decision, 'id' | 'author_session_id'>): boolean {
  if (typeof window === 'undefined') return false
  const sid = getSessionId()
  if (sid && decision.author_session_id && decision.author_session_id === sid) return true
  return isPostedDecisionIdInBrowser(decision.id)
}
