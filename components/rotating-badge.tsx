'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { Crown } from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'

/* ── 타입 ── */
interface SpinRecord {
  id: string
  nickname: string
  speed: number
  created_at: string
}

/* ── 상수 ── */
const SPEED_HISTORY_MS = 150 // 최근 N ms 평균으로 속도 계산
const RECORD_THRESHOLD = 300  // 이 deg/s (= 50 RPM) 이상이어야 기록 등록 가능
const toRPM = (degPerSec: number) => Math.round(degPerSec / 6)

export function RotatingBadge() {
  const [angle, setAngle] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [records, setRecords] = useState<SpinRecord[]>([])
  const [myBestSpeed, setMyBestSpeed] = useState(0)
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [nickname, setNickname] = useState('')
  const [pendingSpeed, setPendingSpeed] = useState(0)
  const [justBroke, setJustBroke] = useState(false)
  const [unlocked, setUnlocked] = useState(false) // 한 번이라도 기록 임계값 넘긴 적 있는지
  const isMobile = useIsMobile()

  const isDragging = useRef(false)
  const lastAngle = useRef(0)
  const autoAngle = useRef(0)
  const rafId = useRef<number>(0)
  const centerRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 속도 계산용: [{ time, angleDelta }]
  const speedHistory = useRef<{ t: number; d: number }[]>([])
  const currentSpeed = useRef(0) // deg/s

  /* ── 자동 회전 ── */
  useEffect(() => {
    let prev = performance.now()
    const tick = (now: number) => {
      if (!isDragging.current) {
        const delta = (now - prev) / 1000
        autoAngle.current += delta * 18
        setAngle(autoAngle.current)
      }
      prev = now
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  /* ── 리더보드 로드 ── */
  const loadRecords = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('spin_records')
      .select('id, nickname, speed, created_at')
      .order('speed', { ascending: false })
      .limit(10)
    if (data) setRecords(data)
  }, [])

  /* ── 기록 저장 ── */
  const saveRecord = async (name: string, speed: number) => {
    const supabase = createClient()
    const sessionId = getSessionId()
    await supabase.from('spin_records').insert({ session_id: sessionId, nickname: name, speed: Math.round(speed) })
    await loadRecords()
    setShowNamePrompt(false)
    setShowLeaderboard(true)
    setJustBroke(true)
    setTimeout(() => setJustBroke(false), 3000)
  }

  const getAngleFromCenter = (clientX: number, clientY: number) => {
    const { x, y } = centerRef.current
    return Math.atan2(clientY - y, clientX - x) * (180 / Math.PI)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    isDragging.current = true
    speedHistory.current = []
    currentSpeed.current = 0
    lastAngle.current = getAngleFromCenter(e.clientX, e.clientY)
    autoAngle.current = angle
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const current = getAngleFromCenter(e.clientX, e.clientY)
    let diff = current - lastAngle.current
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    autoAngle.current += diff
    lastAngle.current = current
    setAngle(autoAngle.current)

    // 속도 측정
    const now = performance.now()
    speedHistory.current.push({ t: now, d: Math.abs(diff) })
    // SPEED_HISTORY_MS 이전 항목 제거
    speedHistory.current = speedHistory.current.filter(h => now - h.t <= SPEED_HISTORY_MS)
    const totalDeg = speedHistory.current.reduce((s, h) => s + h.d, 0)
    const elapsed = SPEED_HISTORY_MS / 1000
    currentSpeed.current = totalDeg / elapsed
  }

  const onPointerUp = async () => {
    if (!isDragging.current) return
    isDragging.current = false

    const speed = currentSpeed.current
    if (speed < RECORD_THRESHOLD) return

    setUnlocked(true)
    // 최고 기록 갱신 여부 확인
    const supabase = createClient()
    const { data: top } = await supabase
      .from('spin_records')
      .select('speed')
      .order('speed', { ascending: false })
      .limit(1)
      .single()

    const topSpeed = top?.speed ?? 0
    setMyBestSpeed(Math.round(speed))

    if (speed > topSpeed) {
      // 신기록! 이름 입력 받기
      setPendingSpeed(speed)
      setShowNamePrompt(true)
    } else {
      // 기록은 안 깼지만 리더보드 보여주기
      await loadRecords()
      setShowLeaderboard(true)
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-6 right-6 w-[360px] h-[360px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        style={{ zIndex: isMobile ? -1 : 10 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="돌려봐요! 🌀"
      >
        <svg
          viewBox="0 0 360 360"
          className="w-full h-full"
          style={{ transform: `rotate(${angle}deg)` }}
          aria-hidden="true"
        >
          <defs>
            <path
              id="rotating-badge-circle"
              d="M 180,180 m -135,0 a 135,135 0 1,1 270,0 a 135,135 0 1,1 -270,0"
            />
          </defs>
          <text>
            <textPath
              href="#rotating-badge-circle"
              style={{ fill: "#FF6B00", fontSize: "22px", fontWeight: "bold", letterSpacing: "0.2em" }}
            >
              LIKELION ANIMAL LEAGUE ✦ LIKELION ANIMAL LEAGUE ✦
            </textPath>
          </text>
        </svg>

        {/* 중앙 리더보드 버튼 — 빠르게 돌린 사람에게만 노출 */}
        {unlocked && (
          <button
            className="absolute flex flex-col items-center justify-center gap-0.5 rounded-full w-20 h-20 bg-orange-400 hover:bg-orange-500 active:scale-95 transition-all shadow-lg text-white animate-[fadeIn_0.4s_ease]"
            onPointerDown={e => e.stopPropagation()}
            onClick={async (e) => {
              e.stopPropagation()
              await loadRecords()
              setShowLeaderboard(true)
            }}
            title="최고 기록 보기"
          >
            <Crown weight="fill" className="h-6 w-6 text-yellow-200" />
            <span className="text-[10px] font-bold leading-tight">명예의전당</span>
          </button>
        )}
      </div>

      {/* 이름 입력 모달 */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNamePrompt(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-lg font-extrabold text-orange-500 mb-1">신기록 달성!</h2>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-bold text-foreground">{toRPM(pendingSpeed).toLocaleString()} RPM</span>
            </p>
            <p className="text-xs text-muted-foreground mb-4">이름을 남겨서 명예의 전당에 올라가세요 👑</p>
            <input
              autoFocus
              type="text"
              maxLength={12}
              placeholder="닉네임 (최대 12자)"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && nickname.trim() && saveRecord(nickname.trim(), pendingSpeed)}
              className="w-full rounded-xl border-2 border-orange-300 px-4 py-2 text-sm font-semibold outline-none focus:border-orange-500 mb-3 dark:bg-gray-800"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 rounded-xl border-2 border-border py-2 text-sm font-semibold hover:bg-muted transition-colors"
              >취소</button>
              <button
                disabled={!nickname.trim()}
                onClick={() => saveRecord(nickname.trim(), pendingSpeed)}
                className="flex-1 rounded-xl bg-orange-400 hover:bg-orange-500 disabled:opacity-40 py-2 text-sm font-bold text-white transition-colors"
              >등록</button>
            </div>
          </div>
        </div>
      )}

      {/* 리더보드 모달 */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLeaderboard(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown weight="fill" className="h-5 w-5 text-yellow-400" />
                <h2 className="text-base font-extrabold">🌀 스핀 명예의 전당</h2>
              </div>
              <button onClick={() => setShowLeaderboard(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">✕</button>
            </div>

            {justBroke && (
              <div className="mb-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 px-4 py-2 text-center text-sm font-bold text-orange-500">
                🎉 신기록 등록 완료!
              </div>
            )}

            {myBestSpeed > 0 && (
              <p className="mb-3 text-center text-xs text-muted-foreground">
                이번 기록: <span className="font-bold text-foreground">{toRPM(myBestSpeed).toLocaleString()} RPM</span>
              </p>
            )}

            {records.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 기록이 없어요. 첫 주자가 돼보세요! 🌀</p>
            ) : (
              <ol className="space-y-2">
                {records.map((r, i) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
                    <span className="text-lg w-6 text-center">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
                    <span className="flex-1 text-sm font-bold truncate">{r.nickname}</span>
                    <span className="text-sm font-extrabold text-orange-500">{toRPM(Number(r.speed)).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">RPM</span></span>
                  </li>
                ))}
              </ol>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">휠을 빠르게 돌려서 기록을 세워보세요 💨</p>
          </div>
        </div>
      )}
    </>
  )
}
