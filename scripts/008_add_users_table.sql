-- 008: 간단한 로그인용 users 테이블 추가
-- username + password_hash 기반 세션 일관성 유지

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- RLS: 무인증 공개 앱 정책 (다른 테이블과 동일)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public select users"  ON users FOR SELECT USING (true);
CREATE POLICY "public insert users"  ON users FOR INSERT WITH CHECK (true);
