-- Add last_watched_second to lesson_progress for precise resume
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS last_watched_second INTEGER DEFAULT 0;

COMMENT ON COLUMN lesson_progress.last_watched_second IS 'The exact second where the user left off, for precise resume functionality';
