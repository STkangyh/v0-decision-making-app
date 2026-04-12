import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calcPercent, getTimeAgo, formatRemainingTime } from '@/lib/vote-utils'

describe('calcPercent', () => {
  it('0표일 때 50% 반환 (초기 균형)', () => {
    expect(calcPercent(0, 0)).toBe(50)
  })

  it('전체가 A일 때 100%', () => {
    expect(calcPercent(10, 10)).toBe(100)
  })

  it('전체가 B일 때 A는 0%', () => {
    expect(calcPercent(0, 10)).toBe(0)
  })

  it('반반이면 50%', () => {
    expect(calcPercent(5, 10)).toBe(50)
  })

  it('소수점 반올림 처리', () => {
    expect(calcPercent(1, 3)).toBe(33)
    expect(calcPercent(2, 3)).toBe(67)
  })

  it('큰 숫자도 정확히 처리', () => {
    expect(calcPercent(750, 1000)).toBe(75)
  })
})

describe('getTimeAgo', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-04-12T12:00:00Z'))
  })

  it('30초 전 → 방금 전', () => {
    const date = new Date('2026-04-12T11:59:30Z')
    expect(getTimeAgo(date)).toBe('방금 전')
  })

  it('5분 전', () => {
    const date = new Date('2026-04-12T11:55:00Z')
    expect(getTimeAgo(date)).toBe('5분 전')
  })

  it('2시간 전', () => {
    const date = new Date('2026-04-12T10:00:00Z')
    expect(getTimeAgo(date)).toBe('2시간 전')
  })

  it('3일 전', () => {
    const date = new Date('2026-04-09T12:00:00Z')
    expect(getTimeAgo(date)).toBe('3일 전')
  })

  it('2주 이상 → 날짜 문자열', () => {
    const date = new Date('2026-03-01T12:00:00Z')
    expect(getTimeAgo(date)).toMatch(/\d{4}/)
  })
})

describe('formatRemainingTime', () => {
  it('30초 남음', () => {
    expect(formatRemainingTime(30_000)).toBe('30초 남음')
  })

  it('5분 30초 남음', () => {
    expect(formatRemainingTime(5 * 60_000 + 30_000)).toBe('5분 30초 남음')
  })

  it('정각 분일 때 0초는 표시 안 함 (분 기준)', () => {
    expect(formatRemainingTime(10 * 60_000)).toBe('10분 0초 남음')
  })

  it('2시간 30분 남음', () => {
    expect(formatRemainingTime(2 * 3_600_000 + 30 * 60_000)).toBe('2시간 30분 남음')
  })

  it('1시간 0분 남음', () => {
    expect(formatRemainingTime(3_600_000)).toBe('1시간 0분 남음')
  })
})
