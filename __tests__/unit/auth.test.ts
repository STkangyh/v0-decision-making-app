import { describe, it, expect, beforeEach } from 'vitest'
import { getAuth, setAuth, clearAuth } from '@/lib/auth'

describe('auth utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAuth', () => {
    it('저장된 auth가 없으면 null 반환', () => {
      expect(getAuth()).toBeNull()
    })

    it('저장된 auth 반환', () => {
      setAuth('uuid-abc', 'kimgt')
      const auth = getAuth()
      expect(auth).toEqual({ sessionId: 'uuid-abc', username: 'kimgt' })
    })

    it('손상된 JSON이면 null 반환', () => {
      localStorage.setItem('decide-for-me-auth', '{invalid json}')
      expect(getAuth()).toBeNull()
    })
  })

  describe('setAuth', () => {
    it('sessionId와 username 저장', () => {
      setAuth('session-123', 'testuser')
      const raw = localStorage.getItem('decide-for-me-auth')
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw!)
      expect(parsed.sessionId).toBe('session-123')
      expect(parsed.username).toBe('testuser')
    })

    it('기존 auth 덮어쓰기', () => {
      setAuth('old-session', 'olduser')
      setAuth('new-session', 'newuser')
      expect(getAuth()?.sessionId).toBe('new-session')
      expect(getAuth()?.username).toBe('newuser')
    })
  })

  describe('clearAuth', () => {
    it('auth 삭제 후 null 반환', () => {
      setAuth('session-abc', 'user')
      clearAuth()
      expect(getAuth()).toBeNull()
    })

    it('auth 없을 때 clearAuth 호출해도 에러 없음', () => {
      expect(() => clearAuth()).not.toThrow()
    })
  })
})
