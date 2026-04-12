import { describe, it, expect } from 'vitest'
import { CATEGORIES, CATEGORY_EMOJIS, DEADLINE_OPTIONS } from '@/lib/types'

describe('CATEGORIES', () => {
  it('8개 카테고리 정의', () => {
    expect(CATEGORIES).toHaveLength(8)
  })

  it('스포츠, 친구 포함', () => {
    expect(CATEGORIES).toContain('스포츠')
    expect(CATEGORIES).toContain('친구')
  })

  it('기본 카테고리 포함', () => {
    expect(CATEGORIES).toContain('음식')
    expect(CATEGORIES).toContain('패션')
    expect(CATEGORIES).toContain('여가')
    expect(CATEGORIES).toContain('공부')
    expect(CATEGORIES).toContain('연애')
    expect(CATEGORIES).toContain('기타')
  })

  it('중복 없음', () => {
    const set = new Set(CATEGORIES)
    expect(set.size).toBe(CATEGORIES.length)
  })
})

describe('CATEGORY_EMOJIS', () => {
  it('모든 카테고리에 이모지 존재', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_EMOJIS[cat]).toBeTruthy()
    }
  })
})

describe('DEADLINE_OPTIONS', () => {
  it('6가지 마감 옵션 존재', () => {
    expect(DEADLINE_OPTIONS).toHaveLength(6)
  })

  it('오름차순 정렬', () => {
    const values = DEADLINE_OPTIONS.map((o) => o.value)
    const sorted = [...values].sort((a, b) => a - b)
    expect(values).toEqual(sorted)
  })

  it('최소 30분, 최대 1440분(24시간)', () => {
    const values = DEADLINE_OPTIONS.map((o) => o.value)
    expect(Math.min(...values)).toBe(30)
    expect(Math.max(...values)).toBe(1440)
  })
})
