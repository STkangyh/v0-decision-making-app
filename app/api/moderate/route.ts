import { NextRequest, NextResponse } from 'next/server'

const PROFANITY_API_URL = process.env.PROFANITY_API_URL
const PROFANITY_API_KEY = process.env.PROFANITY_API_KEY

export async function POST(request: NextRequest) {
  const { text } = await request.json()

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ blocked: false })
  }

  if (!PROFANITY_API_KEY || !PROFANITY_API_URL) {
    console.error('[moderate] 환경변수 누락')
    return NextResponse.json({ blocked: false })
  }

  try {
    const res = await fetch(`${PROFANITY_API_URL}/api/v1/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'x-api-key': PROFANITY_API_KEY,
      },
      body: JSON.stringify({ text, mode: 'NORMAL' }),
    })

    if (!res.ok) {
      // API 오류 시 통과 (서비스 가용성 보장)
      return NextResponse.json({ blocked: false })
    }

    const data = await res.json()
    const detected: { filteredWord: string }[] = data.detected ?? []
    const blocked = detected.length > 0

    return NextResponse.json({
      blocked,
      words: detected.map((d) => d.filteredWord),
    })
  } catch {
    // 네트워크 오류 시 통과
    return NextResponse.json({ blocked: false })
  }
}
