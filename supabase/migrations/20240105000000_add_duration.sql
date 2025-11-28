-- Add duration column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS duration INTEGER; -- Duration in seconds

COMMENT ON COLUMN lessons.duration IS 'Video duration in seconds';
