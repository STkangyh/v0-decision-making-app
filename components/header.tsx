'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { PlusCircle, Smiley, SignOut, User } from '@phosphor-icons/react'
import { ThemeSelector } from './theme-selector'
import { useAuth } from './auth-provider'

function LogoMark() {
  const [imgError, setImgError] = useState(false)

  if (!imgError) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
        <Image
          src="/images/logo.svg"
          alt="로고"
          width={40}
          height={40}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          priority
        />
      </div>
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl btn-gradient text-xl shadow-md group-hover:scale-105 transition-transform">
      <Smiley weight="fill" className="text-white" />
    </div>
  )
}

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 glass">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark />
          <span className="text-[15px] text-[var(--orange-600)] font-extrabold tracking-tight">고민 많이 될거야</span>
        </Link>

        {/* 우측 컨트롤 */}
        <div className="flex items-center gap-2">
          <ThemeSelector />

          {/* 유저 정보 */}
          {user && (
            <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
              <Link href="/mypage" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <User weight="fill" className="h-4 w-4 text-[var(--orange-600)]" />
                <span className="text-sm font-semibold text-foreground">{user.username}</span>
              </Link>
              <button
                onClick={logout}
                title="로그아웃"
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <SignOut weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <Link href="/new">
            <button className="btn-gradient flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-md">
              <PlusCircle weight="bold" className="h-4 w-4" />
              요청하기
            </button>
          </Link>
        </div>

      </div>
    </header>
  )
}
