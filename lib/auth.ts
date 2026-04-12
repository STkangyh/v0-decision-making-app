'use client'

const AUTH_KEY = 'decide-for-me-auth'

export interface AuthUser {
  sessionId: string
  username: string
}

export function getAuth(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setAuth(sessionId: string, username: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ sessionId, username }))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
}
