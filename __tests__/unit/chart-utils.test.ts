import { describe, it, expect } from 'vitest'
import { buildChartData } from '@/lib/chart-utils'

const T0 = '2026-04-12T10:00:00.000Z'
const T1 = '2026-04-12T10:20:00.000Z' // +20분 (같은 버킷)
const T2 = '2026-04-12T10:35:00.000Z' // +35분 (두 번째 버킷)
const T3 = '2026-04-12T11:10:00.000Z' // +70분 (세 번째 버킷)

describe('buildChartData', () => {
  it('투표 1개면 빈 배열 반환', () => {
    const result = buildChartData([{ selected_option: 'A', created_at: T0 }])
    expect(result).toHaveLength(0)
  })

  it('투표 0개면 빈 배열 반환', () => {
    expect(buildChartData([])).toHaveLength(0)
  })

  it('같은 버킷 2개 → 첫 버킷에 합산', () => {
    // T0=10:00, T1=10:20 → 20분 차 → ceil(20/30)+1 = 2 버킷
    // 두 투표 모두 0번 버킷에 들어감
    const votes = [
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'B', created_at: T1 },
    ]
    const result = buildChartData(votes)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].time).toBe('시작')
    expect(result[0].A).toBe(1)
    expect(result[0].B).toBe(1)
    expect(result[0].신규).toBe(2)
  })

  it('두 버킷에 걸쳐 누적 합산', () => {
    const votes = [
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'A', created_at: T2 }, // 두 번째 버킷
    ]
    const result = buildChartData(votes)
    expect(result.length).toBeGreaterThanOrEqual(2)
    // 두 번째 포인트는 누적이어야 함
    const last = result[result.length - 1]
    expect(last.A).toBe(2)
    expect(last.B).toBe(0)
  })

  it('첫 포인트 label은 "시작"', () => {
    const votes = [
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'B', created_at: T2 },
    ]
    expect(buildChartData(votes)[0].time).toBe('시작')
  })

  it('30분 버킷 label은 "+30분"', () => {
    const votes = [
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'B', created_at: T2 },
    ]
    const result = buildChartData(votes)
    expect(result[1].time).toBe('+30분')
  })

  it('60분 이상 버킷 label은 시간 형식', () => {
    const votes = [
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'B', created_at: T3 }, // +70분
    ]
    const result = buildChartData(votes)
    const lastLabel = result[result.length - 1].time
    expect(lastLabel).toMatch(/\+\d+시간|\+\d+h/)
  })

  it('A, B 각각 집계', () => {
    const votes = [
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'B', created_at: T0 },
      { selected_option: 'A', created_at: T0 },
      { selected_option: 'A', created_at: T2 },
    ]
    const result = buildChartData(votes)
    const last = result[result.length - 1]
    expect(last.A).toBe(3)
    expect(last.B).toBe(1)
  })
})
