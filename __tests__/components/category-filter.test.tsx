import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from '@/components/category-filter'
import { CATEGORIES } from '@/lib/types'

describe('CategoryFilter', () => {
  it('전체 버튼 렌더링', () => {
    render(<CategoryFilter selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText('전체')).toBeInTheDocument()
  })

  it('모든 카테고리 버튼 렌더링', () => {
    render(<CategoryFilter selected={null} onSelect={vi.fn()} />)
    for (const cat of CATEGORIES) {
      expect(screen.getByText(cat)).toBeInTheDocument()
    }
  })

  it('전체 클릭 시 onSelect(null) 호출', () => {
    const onSelect = vi.fn()
    render(<CategoryFilter selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('전체'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('카테고리 클릭 시 해당 카테고리로 onSelect 호출', () => {
    const onSelect = vi.fn()
    render(<CategoryFilter selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('음식'))
    expect(onSelect).toHaveBeenCalledWith('음식')
  })

  it('selected 카테고리에 active 스타일 적용', () => {
    render(<CategoryFilter selected="음식" onSelect={vi.fn()} />)
    const btn = screen.getByText('음식').closest('button')
    expect(btn?.className).toContain('bg-orange-500')
  })

  it('스포츠, 친구 신규 카테고리 존재', () => {
    render(<CategoryFilter selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText('스포츠')).toBeInTheDocument()
    expect(screen.getByText('친구')).toBeInTheDocument()
  })
})
