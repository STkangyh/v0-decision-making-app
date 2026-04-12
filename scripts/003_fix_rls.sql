-- 익명 사용자를 위한 RLS 정책 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow anyone to read decisions" ON decisions;
DROP POLICY IF EXISTS "Allow anyone to insert decisions" ON decisions;
DROP POLICY IF EXISTS "Allow creator to update decisions" ON decisions;
DROP POLICY IF EXISTS "Allow creator to delete decisions" ON decisions;

DROP POLICY IF EXISTS "Allow anyone to read votes" ON votes;
DROP POLICY IF EXISTS "Allow anyone to insert votes" ON votes;

DROP POLICY IF EXISTS "Allow anyone to read comments" ON comments;
DROP POLICY IF EXISTS "Allow anyone to insert comments" ON comments;
DROP POLICY IF EXISTS "Allow commenter to delete own comments" ON comments;

-- 새로운 정책 생성: 모든 사용자(익명 포함)가 CRUD 가능하도록
-- Decisions 테이블
CREATE POLICY "decisions_select" ON decisions FOR SELECT USING (true);
CREATE POLICY "decisions_insert" ON decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "decisions_update" ON decisions FOR UPDATE USING (true);
CREATE POLICY "decisions_delete" ON decisions FOR DELETE USING (true);

-- Votes 테이블
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (true);

-- Comments 테이블
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (true);
