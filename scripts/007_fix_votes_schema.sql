-- Idempotent migration to ensure the votes and comments tables use session_id,
-- decisions has votes_a/votes_b columns, and the vote-count trigger is active.
-- Safe to run even if 006_fix_schema.sql was already applied partially or fully.

-- Fix 1: rename voter_id → session_id in votes (if voter_id still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'voter_id'
  ) THEN
    ALTER TABLE votes RENAME COLUMN voter_id TO session_id;
  END IF;
END $$;

-- Fix 2: update UNIQUE constraint name after rename (drop old, add new if missing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'votes' AND constraint_name = 'votes_decision_id_voter_id_key'
  ) THEN
    ALTER TABLE votes DROP CONSTRAINT votes_decision_id_voter_id_key;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'votes' AND constraint_name = 'votes_decision_id_session_id_key'
  ) THEN
    ALTER TABLE votes
      ADD CONSTRAINT votes_decision_id_session_id_key UNIQUE (decision_id, session_id);
  END IF;
END $$;

-- Fix 3: rename commenter_id → session_id in comments (if commenter_id still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'commenter_id'
  ) THEN
    ALTER TABLE comments RENAME COLUMN commenter_id TO session_id;
  END IF;
END $$;

-- Fix 4: add session_id to comments if neither commenter_id nor session_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- Fix 5: add votes_a and votes_b to decisions if missing
ALTER TABLE decisions
  ADD COLUMN IF NOT EXISTS votes_a INTEGER NOT NULL DEFAULT 0;
ALTER TABLE decisions
  ADD COLUMN IF NOT EXISTS votes_b INTEGER NOT NULL DEFAULT 0;

-- Fix 6: create/replace the trigger function that keeps votes_a/votes_b in sync
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.selected_option = 'A' THEN
    UPDATE public.decisions
    SET votes_a = votes_a + 1, updated_at = NOW()
    WHERE id = NEW.decision_id;
  ELSIF NEW.selected_option = 'B' THEN
    UPDATE public.decisions
    SET votes_b = votes_b + 1, updated_at = NOW()
    WHERE id = NEW.decision_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 7: attach the trigger to the votes table (replace if already present)
DROP TRIGGER IF EXISTS trigger_increment_vote_count ON votes;
CREATE TRIGGER trigger_increment_vote_count
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_vote_count();
