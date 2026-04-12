-- 앱 코드는 votes.session_id 를 사용합니다. 구버전(001) 스키마만 적용된 경우 실행하세요.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'votes' AND column_name = 'voter_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'votes' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.votes RENAME COLUMN voter_id TO session_id;
  END IF;
END $$;
