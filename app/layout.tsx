import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SeasonProvider } from '@/lib/season-context'
import { AuthProvider } from '@/components/auth-provider'
import { Top3Popup } from '@/components/top3-popup'
import { RotatingBadge } from '@/components/rotating-badge'
import { Toaster } from 'sonner'
import './globals.css'

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const BASE_URL = 'https://v0-decision-making-app-blush.vercel.app'

export const metadata: Metadata = {
  title: '대신 결정해 줘!',
  description: '공부하다 막히면 우리한테 맡겨 — 익명 A/B 투표 앱',
  openGraph: {
    title: '대신 결정해 줘!',
    description: '공부하다 막히면 우리한테 맡겨 — 익명 A/B 투표 앱',
    url: BASE_URL,
    siteName: '대신 결정해 줘!',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '대신 결정해 줘!',
    description: '공부하다 막히면 우리한테 맡겨',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        className="${geistMono.variable} min-h-full flex flex-col antialiased"
        style={{ fontFamily: "'Pretendard', sans-serif" }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <SeasonProvider>
<AuthProvider>
              {children}
              <Top3Popup />
            </AuthProvider>
            <Toaster richColors position="top-center" />
          </SeasonProvider>
        </ThemeProvider>
        <RotatingBadge />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
