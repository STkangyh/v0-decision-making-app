import { describe, it, expect, beforeEach } from 'vitest'
import { getSessionId } from '@/lib/session'

describe('getSessionId', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('처음 호출 시 UUID 생성 후 localStorage 저장', () => {
    const id = getSessionId()
    expect(id).toBe('test-uuid-1234-5678-abcd-ef0123456789')
    expect(localStorage.getItem('decide-for-me-session-id')).toBe(id)
  })

  it('두 번 호출해도 같은 ID 반환', () => {
    const id1 = getSessionId()
    const id2 = getSessionId()
    expect(id1).toBe(id2)
  })

  it('로그인된 경우 auth sessionId 우선 반환', () => {
    const authData = { sessionId: 'auth-session-abc', username: 'kimgt' }
    localStorage.setItem('decide-for-me-auth', JSON.stringify(authData))
    const id = getSessionId()
    expect(id).toBe('auth-session-abc')
  })

  it('로그인 auth 데이터가 없으면 익명 UUID 사용', () => {
    const id = getSessionId()
    expect(id).toBeTruthy()
    expect(id.length).toBeGreaterThan(0)
  })
})
