'use client'

import { useTheme } from 'next-themes'
import { useSeason, type Season } from '@/lib/season-context'
import { Sun, Moon, Flower, Waves, Leaf, Snowflake } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const SEASONS: { key: Season; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'spring', label: '봄',  icon: <Flower  weight="fill" />, color: 'text-pink-400' },
  { key: 'summer', label: '여름', icon: <Waves   weight="fill" />, color: 'text-cyan-400' },
  { key: 'fall',   label: '가을', icon: <Leaf    weight="fill" />, color: 'text-orange-400' },
  { key: 'winter', label: '겨울', icon: <Snowflake weight="fill" />, color: 'text-indigo-400' },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { season, setSeason } = useSeason()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-1.5">
      {/* 시즌 선택 */}
      <div className="glass flex items-center gap-0.5 rounded-full px-1.5 py-1.5">
        {SEASONS.map(({ key, label, icon, color }) => (
          <button
            key={key}
            onClick={() => setSeason(key)}
            title={label}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-base transition-all duration-200',
              season === key
                ? 'bg-white/80 dark:bg-white/15 shadow-sm scale-110 ' + color
                : 'text-muted-foreground hover:text-foreground hover:scale-105'
            )}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* 라이트/다크 토글 */}
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
    </div>
  )
}
