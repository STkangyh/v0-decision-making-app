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
      <Image
        src="/images/lion.png"
        alt="사자 로고"
        width={44}
        height={44}
        className="h-11 w-11 object-contain group-hover:scale-110 transition-transform drop-shadow-sm"
        onError={() => setImgError(true)}
        priority
      />
    )
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl btn-gradient text-xl shadow-md group-hover:scale-105 transition-transform">
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
          <span className="text-[15px] font-extrabold gradient-text tracking-tight">대신 결정해 줘!</span>
        </Link>

        {/* 우측 컨트롤 */}
        <div className="flex items-center gap-2">
          <ThemeSelector />

          {/* 유저 정보 */}
          {user && (
            <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
              <Link href="/mypage" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <User weight="fill" className="h-4 w-4 text-primary" />
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
