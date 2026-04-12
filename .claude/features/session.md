# Feature: 익명 세션 (Anonymous Session)

## 관련 파일
- `lib/session.ts` — 세션 ID 생성/조회

## 동작 방식
```ts
const SESSION_KEY = 'decide-for-me-session-id'

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}
```

- 첫 방문 시 UUID 자동 생성 → localStorage 영구 저장
- 이후 방문 시 동일 UUID 반환
- 브라우저 localStorage 클리어 시 새 UUID 발급 → 이전 투표/댓글 소유권 소실

## 서버 컴포넌트에서의 제약
```ts
const sessionId = typeof window !== 'undefined' ? getSessionId() : ''
```
- `window` 없는 환경(SSR)에서는 빈 문자열 반환
- 세션 ID가 필요한 모든 로직은 클라이언트 컴포넌트에서만 실행

## 설계 의도
- 별도 회원가입/로그인 없이 익명 참여
- 동일 브라우저에서 일관된 사용자 식별
- 보안보다 편의성 우선 (퍼블릭 투표 앱)

## 주의사항
- 세션 ID는 노출되어도 무방한 값이나, 타인의 세션 ID를 알면 소유권 위장 가능
- 현재 서버/DB 레벨 세션 검증 없음
