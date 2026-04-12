-- Fix 1: votes 테이블의 voter_id 컬럼을 session_id로 이름 변경
ALTER TABLE votes RENAME COLUMN voter_id TO session_id;

-- Fix 2: UNIQUE 제약 조건 이름 업데이트 (voter_id → session_id)
ALTER TABLE votes
  DROP CONSTRAINT IF EXISTS votes_decision_id_voter_id_key;
ALTER TABLE votes
  ADD CONSTRAINT votes_decision_id_session_id_key UNIQUE (decision_id, session_id);

-- Fix 3: comments 테이블의 commenter_id 컬럼을 session_id로 이름 변경
ALTER TABLE comments RENAME COLUMN commenter_id TO session_id;

-- Fix 4: decisions 테이블에 votes_a, votes_b 컬럼 추가
ALTER TABLE decisions
  ADD COLUMN IF NOT EXISTS votes_a INTEGER NOT NULL DEFAULT 0;
ALTER TABLE decisions
  ADD COLUMN IF NOT EXISTS votes_b INTEGER NOT NULL DEFAULT 0;

-- Fix 5: 투표 시 decisions 테이블의 votes_a/votes_b를 자동으로 증가시키는 트리거 함수 생성
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.selected_option = 'A' THEN
    UPDATE decisions
    SET votes_a = votes_a + 1, updated_at = NOW()
    WHERE id = NEW.decision_id;
  ELSIF NEW.selected_option = 'B' THEN
    UPDATE decisions
    SET votes_b = votes_b + 1, updated_at = NOW()
    WHERE id = NEW.decision_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 6: votes 테이블에 트리거 적용
DROP TRIGGER IF EXISTS trigger_increment_vote_count ON votes;
CREATE TRIGGER trigger_increment_vote_count
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_vote_count();
