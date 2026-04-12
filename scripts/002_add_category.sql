-- decisions 테이블에 category 컬럼 추가
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '기타';

-- comments 테이블에 commenter_id 컬럼 추가 (댓글 삭제용)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS commenter_id TEXT;

-- 댓글 삭제 정책 추가
CREATE POLICY "Anyone can delete their own comments" ON comments FOR DELETE USING (true);
