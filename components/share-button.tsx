'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Link2, Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  decisionId: string
  title: string
  variant?: 'icon' | 'full'
}

export function ShareButton({ decisionId, title, variant = 'full' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/decision/${decisionId}`
  const shareText = `${title} — 대신 결정해 줘!`

  const handleShare = async () => {
    // 모바일: Web Share API 우선 사용
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl })
        return
      } catch {
        // 사용자가 취소한 경우 무시
        return
      }
    }

    // 데스크톱: 클립보드 복사
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('링크가 복사되었습니다!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 불가 시 fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      toast.success('링크가 복사되었습니다!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleXShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleInstagramShare = async () => {
    // 모바일: Web Share API로 인스타그램 포함 네이티브 공유 시트 호출
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl })
        return
      } catch {
        return
      }
    }
    // 데스크톱: 링크 복사 후 안내
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    toast.success('링크 복사 완료! 인스타그램 스토리에 붙여넣으세요 📋')
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        title="링크 복사"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-1.5"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            복사됨
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            공유
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleXShare}
        className="gap-1.5 px-2.5"
        title="X(트위터)에 공유"
      >
        <XIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleInstagramShare}
        className="gap-1.5 px-2.5"
        title="인스타그램에 공유"
      >
        <InstagramIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L2.25 2.25h6.846l4.262 5.634L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}
