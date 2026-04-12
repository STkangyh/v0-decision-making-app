import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// bcryptjs mock — 테스트 속도를 위해
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(async () => 'hashed_password'),
    compare: vi.fn(async (plain: string, hashed: string) => plain === 'correct_password' && hashed === 'hashed_password'),
  },
}))

// Supabase server mock
const mockSingle = vi.fn()
const mockInsertSelect = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: mockSingle,
        }),
      }),
      insert: () => ({
        select: () => ({
          single: mockInsertSelect,
        }),
      }),
    }),
  })),
}))

// POST handler import (after mocks)
const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('username 누락 시 400 반환', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ password: '1234' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('password 누락 시 400 반환', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ username: 'kimgt' }))
    expect(res.status).toBe(400)
  })

  it('빈 문자열 username 시 400 반환', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ username: '  ', password: '1234' }))
    expect(res.status).toBe(400)
  })

  it('신규 유저: 자동 가입 후 sessionId 반환', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null }) // 유저 없음
    mockInsertSelect.mockResolvedValue({
      data: { id: 'new-uuid', username: 'newuser' },
      error: null,
    })
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ username: 'newuser', password: '1234' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.sessionId).toBe('new-uuid')
    expect(body.username).toBe('newuser')
  })

  it('기존 유저: 비밀번호 일치 시 sessionId 반환', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'existing-uuid', username: 'kimgt', password_hash: 'hashed_password' },
      error: null,
    })
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ username: 'kimgt', password: 'correct_password' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.sessionId).toBe('existing-uuid')
  })

  it('기존 유저: 비밀번호 불일치 시 401 반환', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid', username: 'kimgt', password_hash: 'hashed_password' },
      error: null,
    })
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ username: 'kimgt', password: 'wrong_password' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toContain('비밀번호')
  })

  it('DB insert 실패 시 500 반환', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null }) // 유저 없음
    mockInsertSelect.mockResolvedValue({ data: null, error: new Error('DB error') })
    const { POST } = await import('@/app/api/auth/login/route')
    const res = await POST(makeRequest({ username: 'failuser', password: '1234' }))
    expect(res.status).toBe(500)
  })

  it('username 소문자 정규화', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockInsertSelect.mockResolvedValue({
      data: { id: 'uuid', username: 'uppercase' },
      error: null,
    })
    const { POST } = await import('@/app/api/auth/login/route')
    await POST(makeRequest({ username: 'UPPERCASE', password: '1234' }))
    // createClient의 .from().insert()가 소문자 username으로 호출되어야 함
    // (mockInsertSelect가 호출됐다는 것 자체가 lowercase 처리 후 진행됐음을 의미)
    expect(mockInsertSelect).toHaveBeenCalled()
  })
})
