-- Fix RLS for votes and comments tables

-- Votes table: allow anonymous inserts and selects
DROP POLICY IF EXISTS "votes_select" ON votes;
DROP POLICY IF EXISTS "votes_insert" ON votes;
DROP POLICY IF EXISTS "Allow all to select votes" ON votes;
DROP POLICY IF EXISTS "Allow all to insert votes" ON votes;

CREATE POLICY "Allow all to select votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow all to insert votes" ON votes FOR INSERT WITH CHECK (true);

-- Comments table: allow anonymous CRUD
DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_delete" ON comments;
DROP POLICY IF EXISTS "Allow all to select comments" ON comments;
DROP POLICY IF EXISTS "Allow all to insert comments" ON comments;
DROP POLICY IF EXISTS "Allow all to delete comments" ON comments;

CREATE POLICY "Allow all to select comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow all to insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to delete comments" ON comments FOR DELETE USING (true);
