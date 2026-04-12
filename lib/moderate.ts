'use client'

export async function checkProfanity(text: string): Promise<{ blocked: boolean; words: string[] }> {
  try {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return { blocked: false, words: [] }
    return res.json()
  } catch {
    return { blocked: false, words: [] }
  }
}
