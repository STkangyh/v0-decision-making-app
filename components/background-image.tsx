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
          opacity: 0.13,
          filter: 'blur(6px) saturate(1.2)',
          transform: 'scale(1.05)', // blur 가장자리 잘림 방지
        }}
      />
    </div>
  )
}
