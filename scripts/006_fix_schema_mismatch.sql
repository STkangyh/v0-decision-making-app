-- 006: 코드-DB 스키마 불일치 수정
-- 문제 1: decisions에 votes_a, votes_b 컬럼 없음
-- 문제 2: votes에 session_id 대신 voter_id 사용
-- 문제 3: comments에 session_id 대신 commenter_id 사용

-- 1. decisions 테이블에 votes_a, votes_b 추가
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS votes_a INT DEFAULT 0;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS votes_b INT DEFAULT 0;

-- 2. 기존 votes 데이터로 votes_a, votes_b 동기화
UPDATE decisions d SET
  votes_a = (SELECT COUNT(*) FROM votes v WHERE v.decision_id = d.id AND v.selected_option = 'A'),
  votes_b = (SELECT COUNT(*) FROM votes v WHERE v.decision_id = d.id AND v.selected_option = 'B');

-- 3. votes 테이블에 session_id 컬럼 추가 (voter_id 값 복사)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS session_id TEXT;
UPDATE votes SET session_id = voter_id WHERE session_id IS NULL;

-- 4. votes (decision_id, session_id) UNIQUE 제약 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'votes_decision_id_session_id_key'
  ) THEN
    ALTER TABLE votes ADD CONSTRAINT votes_decision_id_session_id_key UNIQUE (decision_id, session_id);
  END IF;
END $$;

-- 5. 투표 삽입 시 votes_a/votes_b 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.selected_option = 'A' THEN
    UPDATE decisions SET votes_a = votes_a + 1 WHERE id = NEW.decision_id;
  ELSIF NEW.selected_option = 'B' THEN
    UPDATE decisions SET votes_b = votes_b + 1 WHERE id = NEW.decision_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_vote_counts ON votes;
CREATE TRIGGER trigger_update_vote_counts
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- 6. comments 테이블에 session_id 컬럼 추가 (commenter_id 값 복사)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS session_id TEXT;
UPDATE comments SET session_id = commenter_id WHERE session_id IS NULL AND commenter_id IS NOT NULL;
