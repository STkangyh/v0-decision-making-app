-- 007: decisions 테이블에 author_session_id 컬럼 추가
-- 내 질문(My) 화면용: 글 등록 시 브라우저 세션 ID를 저장합니다.

ALTER TABLE decisions ADD COLUMN IF NOT EXISTS author_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_decisions_author_session_id ON decisions(author_session_id);
