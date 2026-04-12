import { createClient } from '@/lib/supabase/server'
import { fetchVoteTotalsForDecisions, mergeDecisionVoteTotals } from '@/lib/supabase/vote-counts'
import { notFound } from 'next/navigation'
import { DecisionDetail } from './decision-detail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DecisionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: decision, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !decision) {
    notFound()
  }

  const totals = await fetchVoteTotalsForDecisions(supabase, [id])
  const decisionWithVotes = mergeDecisionVoteTotals([decision], totals)[0]

  return <DecisionDetail decision={decisionWithVotes} />
}
