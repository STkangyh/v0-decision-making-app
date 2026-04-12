'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg shadow-sm">
            🤔
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold gradient-text">대신 결정해 줘!</span>
            <span className="text-[10px] text-muted-foreground">시험공부는 잠깐 내려놓고 ✨</span>
          </div>
        </Link>
        <Link href="/new">
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-accent text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all">
            <PlusCircle className="h-4 w-4" />
            결정 요청하기
          </Button>
        </Link>
      </div>
    </header>
  )
}
