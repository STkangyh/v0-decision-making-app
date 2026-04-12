-- Add deadline column to decisions table
ALTER TABLE decisions
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ DEFAULT NULL;

-- Add index for querying by deadline
CREATE INDEX IF NOT EXISTS idx_decisions_deadline ON decisions(deadline);
