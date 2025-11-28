-- Add chapters column to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN lessons.chapters IS 'List of video chapters: [{title: string, startTime: number}]';
