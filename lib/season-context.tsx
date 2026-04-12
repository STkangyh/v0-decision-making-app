'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface SeasonContextValue {
  season: Season
  setSeason: (s: Season) => void
}

const SeasonContext = createContext<SeasonContextValue>({
  season: 'summer',
  setSeason: () => {},
})

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [season, setSeasonState] = useState<Season>('summer')

  useEffect(() => {
    const saved = localStorage.getItem('app-season') as Season | null
    const s = saved ?? 'summer'
    setSeasonState(s)
    document.documentElement.setAttribute('data-season', s)
  }, [])

  const setSeason = (s: Season) => {
    setSeasonState(s)
    localStorage.setItem('app-season', s)
    document.documentElement.setAttribute('data-season', s)
  }

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export const useSeason = () => useContext(SeasonContext)
