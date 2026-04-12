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
