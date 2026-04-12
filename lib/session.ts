'use client'

import { getAuth } from './auth'

const SESSION_KEY = 'decide-for-me-session-id'

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  // 로그인된 경우 → user UUID를 session_id로 사용 (기기 무관하게 동일)
  const auth = getAuth()
  if (auth) return auth.sessionId

  // 미로그인 → 기존 익명 UUID (localStorage)
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}
