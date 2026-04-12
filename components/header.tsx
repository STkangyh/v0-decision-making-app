'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">대신 결정해 줘!</span>
        </Link>
        <Link href="/new">
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            결정 요청하기
          </Button>
        </Link>
      </div>
    </header>
  )
}
