'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getAuth, clearAuth, type AuthUser } from '@/lib/auth'
import { LoginModal } from '@/components/login-modal'

interface AuthContextValue {
  user: AuthUser | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({ user: null, logout: () => {} })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getAuth())
    setMounted(true)
  }, [])

  const logout = () => {
    clearAuth()
    setUser(null)
  }

  const handleLoginSuccess = (username: string) => {
    setUser(getAuth())
    // username은 이미 setAuth로 저장된 상태
    void username
  }

  if (!mounted) return null

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {!user && <LoginModal onSuccess={handleLoginSuccess} />}
      {children}
    </AuthContext.Provider>
  )
}
