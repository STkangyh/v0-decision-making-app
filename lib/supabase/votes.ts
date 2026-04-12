import type { SupabaseClient } from '@supabase/supabase-js'

/** votes 테이블이 repo 구버전(voter_id)일 때 session_id 경로를 voter_id로 재시도 */
function shouldRetryVotesWithVoterId(error: { message?: string; code?: string } | null): boolean {
  if (!error?.message) return false
  const m = error.message.toLowerCase()
  if (m.includes('session_id') && (m.includes('column') || m.includes('schema') || error.code === 'PGRST204')) {
    return true
  }
  if (error.code === '23502' && m.includes('voter_id')) {
    return true
  }
  return false
}

export async function fetchVoteForSession(
  supabase: SupabaseClient,
  decisionId: string,
  sessionId: string,
): Promise<'A' | 'B' | null> {
  let { data, error } = await supabase
    .from('votes')
    .select('selected_option')
    .eq('decision_id', decisionId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error && shouldRetryVotesWithVoterId(error)) {
    ;({ data, error } = await supabase
      .from('votes')
      .select('selected_option')
      .eq('decision_id', decisionId)
      .eq('voter_id', sessionId)
      .maybeSingle())
  }

  if (error) {
    console.error('fetchVoteForSession', error)
    return null
  }
  const opt = data?.selected_option
  return opt === 'A' || opt === 'B' ? opt : null
}

export async function insertVote(
  supabase: SupabaseClient,
  params: { decisionId: string; sessionId: string; option: 'A' | 'B' },
): Promise<{ error: { message: string; code?: string } | null }> {
  const row = {
    decision_id: params.decisionId,
    selected_option: params.option,
  }

  let { error } = await supabase.from('votes').insert({
    ...row,
    session_id: params.sessionId,
  })

  if (error && shouldRetryVotesWithVoterId(error)) {
    ;({ error } = await supabase.from('votes').insert({
      ...row,
      voter_id: params.sessionId,
    }))
  }

  return { error }
}
