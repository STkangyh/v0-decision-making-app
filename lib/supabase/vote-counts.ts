import type { SupabaseClient } from '@supabase/supabase-js'

/** votes 행을 집계해 decisions의 votes_a / votes_b 와 무관하게 실제 득표 수를 구합니다. */
export async function fetchVoteTotalsForDecisions(
  supabase: SupabaseClient,
  decisionIds: string[],
): Promise<Record<string, { votes_a: number; votes_b: number }>> {
  const out: Record<string, { votes_a: number; votes_b: number }> = {}
  if (decisionIds.length === 0) return out

  for (const id of decisionIds) {
    out[id] = { votes_a: 0, votes_b: 0 }
  }

  const { data, error } = await supabase
    .from('votes')
    .select('decision_id, selected_option')
    .in('decision_id', decisionIds)

  if (error || !data) {
    console.error('fetchVoteTotalsForDecisions', error)
    return out
  }

  for (const row of data) {
    const id = row.decision_id as string
    if (!out[id]) out[id] = { votes_a: 0, votes_b: 0 }
    if (row.selected_option === 'A') out[id].votes_a += 1
    else if (row.selected_option === 'B') out[id].votes_b += 1
  }

  return out
}

export function mergeDecisionVoteTotals<T extends { id: string; votes_a?: number; votes_b?: number }>(
  decisions: T[],
  totals: Record<string, { votes_a: number; votes_b: number }>,
): T[] {
  return decisions.map((d) => {
    const t = totals[d.id]
    if (!t) return d
    return {
      ...d,
      votes_a: t.votes_a,
      votes_b: t.votes_b,
    }
  })
}
