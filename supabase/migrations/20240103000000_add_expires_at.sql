-- Add expires_at column to enrollments table
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN enrollments.expires_at IS 'Optional expiration date for course access';
