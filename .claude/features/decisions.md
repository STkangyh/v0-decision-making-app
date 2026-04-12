# Feature: 결정(Decision) 생성 및 관리

## 관련 파일
- `app/page.tsx` — 홈, DecisionList 렌더링
- `app/new/page.tsx` — 결정 생성 폼 (client component)
- `app/decision/[id]/page.tsx` — 결정 상세 (server component, SSR fetch)
- `app/decision/[id]/decision-detail.tsx` — 결정 상세 UI (client component)
- `components/decision-list.tsx` — 목록 + 카테고리 필터
- `components/decision-card.tsx` — 카드형 요약 + 인라인 투표

## 생성 흐름
1. `/new` 폼에서 title, description, option_a, option_b, category, deadlineMinutes 입력
2. `deadline = new Date(Date.now() + deadlineMinutes * 60 * 1000).toISOString()` 계산
3. `supabase.from('decisions').insert(...)` 호출
4. 성공 시 `/`로 redirect + `router.refresh()`

## 마감(closed) 판정
```ts
const isClosed = decision.is_closed || isExpired
// isExpired: deadline이 현재 시각보다 과거
```
- `is_closed`: 수동 마감 (누구나 가능)
- `isExpired`: deadline 자동 만료 (1초 인터벌로 클라이언트 체크)
- 마감 후: 투표 버튼 비활성화, 득표율/득표수 노출, 승리 옵션 하이라이트

## 카테고리 & 마감 옵션 (`lib/types.ts`)
```ts
CATEGORIES = ['음식', '패션', '여가', '공부', '연애', '기타']
DEADLINE_OPTIONS = [30, 60, 180, 360, 720, 1440] // 분 단위
```

## 주의사항
- 삭제/마감 모두 인증 없이 누구나 가능 (무인증 설계)
- `decision/[id]/page.tsx`는 서버 컴포넌트 — Supabase server client 사용
- `decision-detail.tsx`는 클라이언트 컴포넌트 — session ID, 실시간 상태 관리
