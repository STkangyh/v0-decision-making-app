'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Sparkles, UserRound } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="truncate text-lg font-bold text-foreground">대신 결정해 줘!</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="/me" aria-label="내 질문">
            <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">내 질문</span>
            </Button>
          </Link>
          <Link href="/new">
            <Button size="sm" className="gap-1.5 sm:gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">결정 요청하기</span>
              <span className="sm:hidden">요청</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
