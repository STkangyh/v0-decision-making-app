'use client'

import { useState } from 'react'

export function BackgroundImage() {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/background.png"
        alt=""
        onError={() => setShow(false)}
        className="h-full w-full object-cover"
        style={{
          opacity: 0.28,
          filter: 'blur(3px) saturate(1.3)',
          transform: 'scale(1.04)', // blur 가장자리 잘림 방지
        }}
      />
    </div>
  )
}
