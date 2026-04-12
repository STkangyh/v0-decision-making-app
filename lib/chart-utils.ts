/** 투표 차트 데이터 빌더 — 테스트 가능하도록 분리 */

export interface VoteRow {
  selected_option: string
  created_at: string
}

export interface ChartPoint {
  time: string
  A: number
  B: number
  신규: number
}

const INTERVAL_MS = 30 * 60 * 1000 // 30분

export function buildChartData(votes: VoteRow[]): ChartPoint[] {
  if (votes.length < 2) return []

  const start = new Date(votes[0].created_at).getTime()
  const end   = new Date(votes[votes.length - 1].created_at).getTime()
  const totalBuckets = Math.ceil((end - start) / INTERVAL_MS) + 1

  const buckets: { a: number; b: number }[] = Array.from(
    { length: totalBuckets }, () => ({ a: 0, b: 0 })
  )

  for (const vote of votes) {
    const elapsed = new Date(vote.created_at).getTime() - start
    const idx = Math.min(Math.floor(elapsed / INTERVAL_MS), totalBuckets - 1)
    if (vote.selected_option === 'A') buckets[idx].a++
    else buckets[idx].b++
  }

  let cumA = 0, cumB = 0
  return buckets.map((bucket, i) => {
    cumA += bucket.a
    cumB += bucket.b
    const mins = i * 30
    let label: string
    if (i === 0) label = '시작'
    else if (mins < 60) label = `+${mins}분`
    else {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      label = m ? `+${h}h${m}m` : `+${h}시간`
    }
    return { time: label, A: cumA, B: cumB, 신규: bucket.a + bucket.b }
  })
}
