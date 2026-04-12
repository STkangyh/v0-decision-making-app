'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? '라이트 모드' : '다크 모드'}
      className={cn(
        'glass flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all duration-200',
        'text-muted-foreground hover:text-foreground hover:scale-105'
      )}
    >
      {isDark
        ? <Sun weight="fill" className="text-amber-400" />
        : <Moon weight="fill" className="text-indigo-400" />
      }
    </button>
  )
}
