-- 결정 요청 게시글 테이블
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  author_nickname TEXT NOT NULL DEFAULT '익명의 학생',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_closed BOOLEAN DEFAULT FALSE
);

-- 투표 테이블
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL, -- 익명 사용자의 세션 ID나 핑거프린트
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(decision_id, voter_id) -- 한 사용자당 한 번만 투표
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL DEFAULT '익명',
  content TEXT NOT NULL,
  supported_option TEXT CHECK (supported_option IN ('A', 'B', NULL)), -- 어떤 옵션을 지지하는지
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 (공개 앱이므로 모든 사용자가 읽기/쓰기 가능)
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 결정 게시글을 볼 수 있음
CREATE POLICY "Anyone can view decisions" ON decisions FOR SELECT USING (true);
CREATE POLICY "Anyone can create decisions" ON decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update decisions" ON decisions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete decisions" ON decisions FOR DELETE USING (true);

-- 모든 사용자가 투표할 수 있음
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);

-- 모든 사용자가 댓글을 달 수 있음
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
