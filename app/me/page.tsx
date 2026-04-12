'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { Header } from '@/components/header'
import { DecisionCard } from '@/components/decision-card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { fetchMyDecisionsWithCounts } from '@/lib/supabase/my-decisions'
import { ArrowLeft, FolderOpen } from 'lucide-react'

export default function MyDecisionsPage() {
  const { data: decisions, isLoading, error } = useSWR(
    'my-decisions',
    async () => {
      const supabase = createClient()
      return fetchMyDecisionsWithCounts(supabase, getSessionId())
    },
    { refreshInterval: 15_000 },
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">내가 올린 질문</h1>
          <p className="mt-2 text-muted-foreground">
            이 브라우저에서 등록한 결정 요청만 보여요. 다른 기기에서는 목록이 비어 있을 수 있어요.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
            불러오지 못했습니다. Supabase에 <code className="rounded bg-muted px-1">author_session_id</code> 컬럼이
            있는지 확인해 주세요. (<code className="rounded bg-muted px-1">scripts/009_add_author_session_id.sql</code>)
          </div>
        )}

        {!isLoading && !error && decisions?.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen className="size-6" />
              </EmptyMedia>
              <EmptyTitle>아직 올린 질문이 없어요</EmptyTitle>
              <EmptyDescription>새 결정 요청을 올리면 여기에 모여요.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/new">결정 요청하기</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!isLoading && !error && decisions && decisions.length > 0 && (
          <div className="space-y-4">
            {decisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                commentCount={decision.comment_count}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
