import '@testing-library/jest-dom'
import React from 'react'

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// crypto.randomUUID mock
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234-5678-abcd-ef0123456789' },
})

// Next.js Image — React element 반환
vi.mock('next/image', () => ({
  default: ({ src, alt, onError, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { onError?: () => void }) =>
    React.createElement('img', { src, alt, ...props }),
}))

// Next.js Link — React element 반환
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({}),
}))

// sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))
