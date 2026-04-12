'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { setAuth } from '@/lib/auth'
import { UserCircle, Lock, SignIn } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface LoginModalProps {
  onSuccess: (username: string) => void
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }

      setAuth(data.sessionId, data.username)
      onSuccess(data.username)
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass-card w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl btn-gradient shadow-lg">
            <UserCircle weight="fill" className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold gradient-text">대신 결정해 줘!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            이름과 비밀번호로 어디서든 같은 계정을 사용할 수 있어요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <UserCircle weight="fill" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름 (닉네임)"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null) }}
              className={cn('pl-9', error && 'border-destructive')}
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="relative">
            <Lock weight="fill" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              className={cn('pl-9', error && 'border-destructive')}
              maxLength={50}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button
            type="submit"
            className="btn-gradient w-full gap-2 rounded-xl py-2.5 font-bold"
            disabled={!username.trim() || !password.trim() || isLoading}
          >
            {isLoading
              ? <Spinner className="h-4 w-4" />
              : <SignIn weight="bold" className="h-4 w-4" />
            }
            {isLoading ? '확인 중...' : '시작하기'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          처음이면 자동으로 계정이 만들어져요 🎉
        </p>
      </div>
    </div>
  )
}
