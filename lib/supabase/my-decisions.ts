import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchVoteTotalsForDecisions, mergeDecisionVoteTotals } from '@/lib/supabase/vote-counts'
import type { Decision } from '@/lib/types'

export type MyDecisionRow = Decision & {
  comment_count: number
}

export async function fetchMyDecisionsWithCounts(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<MyDecisionRow[]> {
  if (!sessionId) return []

  const { data, error } = await supabase
    .from('decisions')
    .select('*, comments(count)')
    .eq('author_session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = data || []
  const ids = rows.map((d) => d.id as string)
  const totals = await fetchVoteTotalsForDecisions(supabase, ids)
  const merged = mergeDecisionVoteTotals(rows, totals)

  return merged.map((d) => ({
    ...d,
    comment_count: d.comments?.[0]?.count || 0,
  }))
}
