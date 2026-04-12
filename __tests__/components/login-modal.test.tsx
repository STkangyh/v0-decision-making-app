import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginModal } from '@/components/login-modal'

// fetch mock
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('LoginModal', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('이름, 비밀번호 입력 필드 렌더링', () => {
    render(<LoginModal onSuccess={vi.fn()} />)
    expect(screen.getByPlaceholderText('이름 (닉네임)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument()
  })

  it('시작하기 버튼 초기에 비활성화', () => {
    render(<LoginModal onSuccess={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /시작하기/ })
    expect(btn).toBeDisabled()
  })

  it('이름만 입력 시 버튼 여전히 비활성화', async () => {
    render(<LoginModal onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('이름 (닉네임)'), 'kimgt')
    const btn = screen.getByRole('button', { name: /시작하기/ })
    expect(btn).toBeDisabled()
  })

  it('이름+비밀번호 입력 시 버튼 활성화', async () => {
    render(<LoginModal onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('이름 (닉네임)'), 'kimgt')
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), '1234')
    const btn = screen.getByRole('button', { name: /시작하기/ })
    expect(btn).not.toBeDisabled()
  })

  it('로그인 성공 시 onSuccess 호출', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ sessionId: 'uuid-abc', username: 'kimgt' }),
    })
    const onSuccess = vi.fn()
    render(<LoginModal onSuccess={onSuccess} />)
    await userEvent.type(screen.getByPlaceholderText('이름 (닉네임)'), 'kimgt')
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), '1234')
    fireEvent.click(screen.getByRole('button', { name: /시작하기/ }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('kimgt'))
  })

  it('비밀번호 틀림 시 에러 메시지 표시', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: '비밀번호가 틀렸습니다.' }),
    })
    render(<LoginModal onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('이름 (닉네임)'), 'kimgt')
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'wrong')
    fireEvent.click(screen.getByRole('button', { name: /시작하기/ }))
    await waitFor(() => expect(screen.getByText('비밀번호가 틀렸습니다.')).toBeInTheDocument())
  })

  it('네트워크 오류 시 에러 메시지 표시', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    render(<LoginModal onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('이름 (닉네임)'), 'kimgt')
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), '1234')
    fireEvent.click(screen.getByRole('button', { name: /시작하기/ }))
    await waitFor(() => expect(screen.getByText('서버에 연결할 수 없습니다.')).toBeInTheDocument())
  })

  it('처음이면 자동으로 계정이 만들어진다는 안내 문구 표시', () => {
    render(<LoginModal onSuccess={vi.fn()} />)
    expect(screen.getByText(/자동으로 계정이 만들어져요/)).toBeInTheDocument()
  })
})
