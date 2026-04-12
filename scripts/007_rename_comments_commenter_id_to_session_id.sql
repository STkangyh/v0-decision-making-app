-- 앱은 comments.session_id 를 사용합니다. 002에서 commenter_id만 추가된 경우 실행하세요.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'commenter_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.comments RENAME COLUMN commenter_id TO session_id;
  END IF;
END $$;
