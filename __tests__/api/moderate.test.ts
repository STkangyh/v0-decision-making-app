import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFetch = vi.fn()
global.fetch = mockFetch

// 환경변수 설정 (모듈 수준 상수로 읽히므로 import 전에 세팅)
process.env.PROFANITY_API_URL = 'https://profanity-api.test'
process.env.PROFANITY_API_KEY = 'test-api-key'

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/moderate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/moderate', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.resetModules()
  })

  it('text 누락 시 fails open (blocked: false, 200)', async () => {
    const { POST } = await import('@/app/api/moderate/route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.blocked).toBe(false)
  })

  it('비속어 없는 텍스트 → blocked: false', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ detected: [] }),
    })
    const { POST } = await import('@/app/api/moderate/route')
    const res = await POST(makeRequest({ text: '오늘 점심 뭐 먹지?' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.blocked).toBe(false)
  })

  it('비속어 포함 텍스트 → blocked: true, words 반환', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ detected: [{ filteredWord: '욕설' }] }),
    })
    const { POST } = await import('@/app/api/moderate/route')
    const res = await POST(makeRequest({ text: '욕설이 포함된 텍스트' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.blocked).toBe(true)
    expect(body.words).toContain('욕설')
  })

  it('외부 API 오류 시 fails open (blocked: false)', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const { POST } = await import('@/app/api/moderate/route')
    const res = await POST(makeRequest({ text: '텍스트' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.blocked).toBe(false)
  })

  it('외부 API 5xx 시 fails open', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    const { POST } = await import('@/app/api/moderate/route')
    const res = await POST(makeRequest({ text: '텍스트' }))
    const body = await res.json()
    expect(body.blocked).toBe(false)
  })
})
