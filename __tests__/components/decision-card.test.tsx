import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DecisionCard } from '@/components/decision-card'
import type { Decision } from '@/lib/types'

// Supabase mock
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockDelete = vi.fn()
const mockCount = vi.fn()

const chainMock = {
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        count: 'exact',
        head: true,
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/session', () => ({
  getSessionId: () => 'test-session-id',
}))

vi.mock('@/components/share-button', () => ({
  ShareButton: () => null,
}))

const mockDecision: Decision = {
  id: 'decision-1',
  title: '오늘 점심 뭐 먹지?',
  description: '짜장이냐 짬뽕이냐 고민됩니다',
  option_a: '짜장면',
  option_b: '짬뽕',
  category: '음식',
  votes_a: 7,
  votes_b: 3,
  is_closed: false,
  deadline: null,
  author_session_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('DecisionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('제목 렌더링', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('오늘 점심 뭐 먹지?')).toBeInTheDocument()
  })

  it('선택지 A, B 렌더링', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('짜장면')).toBeInTheDocument()
    expect(screen.getByText('짬뽕')).toBeInTheDocument()
  })

  it('카테고리 뱃지 렌더링', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('음식')).toBeInTheDocument()
  })

  it('설명 렌더링', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('짜장이냐 짬뽕이냐 고민됩니다')).toBeInTheDocument()
  })

  it('commentCount 기본값 0으로 표시', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('0개 의견')).toBeInTheDocument()
  })

  it('commentCount prop 반영', () => {
    render(<DecisionCard decision={mockDecision} commentCount={5} />)
    expect(screen.getByText('5개 의견')).toBeInTheDocument()
  })

  it('마감된 결정은 마감됨 배지 표시', () => {
    const closed = { ...mockDecision, is_closed: true }
    render(<DecisionCard decision={closed} />)
    expect(screen.getByText('마감됨')).toBeInTheDocument()
  })

  it('상세 페이지 이동 버튼 존재', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('의견 보기 · 상세 페이지')).toBeInTheDocument()
  })

  it('총 투표수 표시', () => {
    render(<DecisionCard decision={mockDecision} />)
    expect(screen.getByText('10명')).toBeInTheDocument()
  })

  it('마감된 결정에서 퍼센트 표시', async () => {
    const closed = { ...mockDecision, is_closed: true }
    render(<DecisionCard decision={closed} />)
    await waitFor(() => {
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
    })
  })

  it('deadline이 과거면 마감됨 표시', async () => {
    const expired = {
      ...mockDecision,
      deadline: new Date(Date.now() - 60_000).toISOString(),
    }
    render(<DecisionCard decision={expired} />)
    await waitFor(() => {
      expect(screen.getByText('마감됨')).toBeInTheDocument()
    })
  })

  it('deadline이 미래면 남은 시간 표시', async () => {
    const future = {
      ...mockDecision,
      deadline: new Date(Date.now() + 60 * 60_000).toISOString(),
    }
    render(<DecisionCard decision={future} />)
    await waitFor(() => {
      expect(screen.getByText(/남음/)).toBeInTheDocument()
    })
  })
})
