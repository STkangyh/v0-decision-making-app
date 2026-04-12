# Feature: 투표(Vote)

## 관련 파일
- `components/decision-card.tsx` — 목록에서 인라인 투표
- `app/decision/[id]/decision-detail.tsx` — 상세 페이지에서 투표
- `lib/session.ts` — 세션 ID 조회

## 투표 흐름
1. `getSessionId()`로 localStorage UUID 획득
2. `votes` 테이블에 `INSERT {decision_id, session_id, selected_option}`
3. DB UNIQUE(decision_id, session_id) 제약으로 중복 투표 차단
   - 에러 코드 `23505` → "이미 투표하셨습니다!" 토스트
4. 성공 시 로컬 상태(`votes_a` / `votes_b`) 즉시 업데이트

## 투표 결과 표시 조건
- `votedOption !== null` (투표 완료) OR `isClosed === true` (마감)
- 위 조건 충족 시: 득표율 퍼센트 바, % 숫자, 득표수 노출

## 득표율 계산
```ts
const totalVotes = votes_a + votes_b
const percentA = totalVotes > 0 ? Math.round((votes_a / totalVotes) * 100) : 50
const percentB = totalVotes > 0 ? Math.round((votes_b / totalVotes) * 100) : 50
```

## 기존 투표 복원
페이지 마운트 시 `votes` 테이블에서 현재 세션의 기존 투표를 조회 → `setVotedOption` 복원.

## 주의사항
- 투표는 취소/변경 불가 (DB에 수정 로직 없음)
- `isVoting` 상태로 중복 클릭 방지
- 카드(목록)와 상세 페이지 모두 독립적으로 투표 상태 관리
