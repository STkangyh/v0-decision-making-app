# Feature: 댓글(Comment)

## 관련 파일
- `components/comment-section.tsx` — 댓글 전체 UI (목록 + 작성 폼)
- `lib/types.ts` — Comment 타입

## 댓글 흐름
1. `session_id` = `getSessionId()`
2. `comments` 테이블에 `INSERT {decision_id, session_id, content}`
3. 성공 시 `mutate(['comments', decisionId])`로 SWR 캐시 강제 갱신

## 삭제 조건
- `comment.session_id === sessionId` 인 경우에만 삭제 버튼 노출
- `DELETE WHERE id = ? AND session_id = ?` — DB 레벨에서도 본인 댓글만 삭제

## 실시간 갱신
- SWR `refreshInterval: 5000` (5초마다 자동 폴링)

## 주의사항
- 댓글 수정 기능 없음 (삭제 후 재작성)
- 서버 사이드 인증 없음 — session_id 일치 여부로만 소유권 판별
- `maxLength={500}` 클라이언트 제한 (DB 레벨 제한 별도 설정 안 됨)
