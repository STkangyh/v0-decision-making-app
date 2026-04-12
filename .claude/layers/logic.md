# Layer: 비즈니스 로직

## 서버 vs 클라이언트 컴포넌트 분리 원칙

| 상황 | 사용 컴포넌트 |
|---|---|
| 초기 데이터 fetch (SEO/SSR) | Server Component |
| 사용자 상호작용, 실시간 상태 | Client Component (`'use client'`) |
| 세션 ID 접근 | Client Component만 가능 |

## 데이터 fetch 패턴

### 서버 컴포넌트 (1회성)
```ts
// app/decision/[id]/page.tsx
const supabase = await createClient()
const { data: decision } = await supabase.from('decisions').select('*').eq('id', id).single()
```

### 클라이언트 컴포넌트 (SWR 폴링)
```ts
// components/decision-list.tsx
const { data, isLoading, error } = useSWR(
  ['decisions', selectedCategory],
  () => fetchDecisions(selectedCategory),
  { refreshInterval: 10000 }  // 10초 폴링
)

// components/comment-section.tsx
useSWR(['comments', decisionId], ..., { refreshInterval: 5000 })  // 5초 폴링
```

## 마감 시간 실시간 체크
```ts
useEffect(() => {
  const interval = setInterval(() => {
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) setIsExpired(true)
    else setRemainingTime(formatRemainingTime(diff))
  }, 1000)
  return () => clearInterval(interval)
}, [deadline])
```

## 중복 투표 방지 (2중 차단)
1. **클라이언트**: `votedOption !== null`이면 버튼 `disabled`
2. **DB**: UNIQUE(decision_id, session_id) 제약 → 에러 코드 `23505` 처리

## 에러 처리 패턴
```ts
try {
  const { error } = await supabase.from(...).insert(...)
  if (error) throw error
  // 성공 처리
} catch {
  toast.error('실패 메시지')
} finally {
  setIsLoading(false)
}
```
- 에러 객체를 catch로 받지 않음 (TypeScript strict 모드 대응)
- 사용자에게는 toast로만 에러 노출

## 미들웨어 (`middleware.ts`)
- 모든 요청에서 Supabase 세션 갱신 (`updateSession`)
- 정적 파일(`_next/static`, 이미지 등)은 matcher에서 제외
