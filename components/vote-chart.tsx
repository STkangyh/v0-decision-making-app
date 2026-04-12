'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { ChartLine, TrendUp } from '@phosphor-icons/react'

interface VoteChartProps {
  decisionId: string
  optionA: string
  optionB: string
}

interface VoteRow {
  selected_option: string
  created_at: string
}

async function fetchVotes(decisionId: string): Promise<VoteRow[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('votes')
    .select('selected_option, created_at')
    .eq('decision_id', decisionId)
    .order('created_at', { ascending: true })
  return data ?? []
}

interface ChartPoint {
  time: string
  A: number
  B: number
  신규: number
}

function buildChartData(votes: VoteRow[]): ChartPoint[] {
  if (votes.length < 2) return []

  const INTERVAL_MS = 30 * 60 * 1000
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs shadow-lg border border-white/20">
      <p className="mb-1.5 font-bold text-foreground">{label}</p>
      {payload.map((entry: { color: string; name: string; value: number }) => (
        <p key={entry.name} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-semibold text-foreground">{entry.value}표</span>
        </p>
      ))}
    </div>
  )
}

export function VoteChart({ decisionId, optionA, optionB }: VoteChartProps) {
  const { data: votes, isLoading } = useSWR(
    ['vote-chart', decisionId],
    () => fetchVotes(decisionId),
    { refreshInterval: 30000 }
  )

  const chartData = votes ? buildChartData(votes) : []
  const totalVotes = votes?.length ?? 0

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (chartData.length < 2) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground">
        <ChartLine className="h-6 w-6 opacity-40" />
        <p className="text-xs">
          {totalVotes < 2
            ? '투표가 2개 이상 쌓이면 그래프가 표시돼요'
            : '아직 구간 데이터가 충분하지 않아요'}
        </p>
      </div>
    )
  }

  // 최대 구간 증가량 — 어느 구간에서 가장 많이 투표됐는지
  const peakBucket = [...chartData].sort((a, b) => b.신규 - a.신규)[0]

  return (
    <div className="space-y-3">
      {/* 요약 배지 */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
          <TrendUp weight="fill" className="h-3.5 w-3.5" />
          총 {totalVotes}표
        </span>
        {peakBucket.신규 > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            🔥 최다 구간 {peakBucket.time} (+{peakBucket.신규}표)
          </span>
        )}
      </div>

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(var(--primary, 220 90% 56%))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary, 220 90% 56%))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(var(--accent, 340 80% 58%))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--accent, 340 80% 58%))" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            formatter={(value) => value === 'A' ? `A: ${optionA}` : `B: ${optionB}`}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />

          <Area
            type="monotone"
            dataKey="A"
            name="A"
            stroke="oklch(0.58 0.19 213)"
            strokeWidth={2}
            fill="url(#gradA)"
            dot={chartData.length <= 8}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="B"
            name="B"
            stroke="oklch(0.62 0.22 350)"
            strokeWidth={2}
            fill="url(#gradB)"
            dot={chartData.length <= 8}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-center text-[10px] text-muted-foreground">
        30분 간격 누적 투표 수 · 30초마다 자동 갱신
      </p>
    </div>
  )
}
