import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '이름과 비밀번호를 입력해 주세요.' }, { status: 400 })
  }

  const name = username.trim().toLowerCase()
  const supabase = await createClient()

  // 1. 기존 유저 조회
  const { data: existing } = await supabase
    .from('users')
    .select('id, username, password_hash')
    .eq('username', name)
    .single()

  if (existing) {
    // 2a. 있으면 비밀번호 검증
    const match = await bcrypt.compare(password, existing.password_hash)
    if (!match) {
      return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 })
    }
    return NextResponse.json({ sessionId: existing.id, username: existing.username })
  }

  // 2b. 없으면 자동 가입
  const hash = await bcrypt.hash(password, 10)
  const { data: created, error } = await supabase
    .from('users')
    .insert({ username: name, password_hash: hash })
    .select('id, username')
    .single()

  if (error || !created) {
    return NextResponse.json({ error: '가입에 실패했습니다. 다시 시도해 주세요.' }, { status: 500 })
  }

  return NextResponse.json({ sessionId: created.id, username: created.username })
}
