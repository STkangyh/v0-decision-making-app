'use client'

import Image from 'next/image'
import { useState } from 'react'

export function HeroIcon() {
  const [imgError, setImgError] = useState(false)

  if (!imgError) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
        <Image
          src="/images/hero-icon.png"
          alt="히어로 아이콘"
          width={56}
          height={56}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          priority
        />
      </div>
    )
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl btn-gradient text-3xl shadow-lg">
      🎯
    </div>
  )
}
