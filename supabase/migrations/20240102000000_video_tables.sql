-- Add video-related tables for tracking and security
-- This version uses IF NOT EXISTS to prevent errors on re-run

-- Video access logs (for security monitoring)
CREATE TABLE IF NOT EXISTS video_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Add video provider info to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS video_provider TEXT DEFAULT 'bunny',
ADD COLUMN IF NOT EXISTS video_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_access_logs_user_id ON video_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_access_logs_lesson_id ON video_access_logs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_access_logs_accessed_at ON video_access_logs(accessed_at);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(completed);

-- RLS Policies for video_access_logs
ALTER TABLE video_access_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own access logs" ON video_access_logs;
CREATE POLICY "Users can view their own access logs"
    ON video_access_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert access logs" ON video_access_logs;
CREATE POLICY "System can insert access logs"
    ON video_access_logs FOR INSERT
    WITH CHECK (true);

-- RLS Policies for lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own progress" ON lesson_progress;
CREATE POLICY "Users can view their own progress"
    ON lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON lesson_progress;
CREATE POLICY "Users can insert their own progress"
    ON lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON lesson_progress;
CREATE POLICY "Users can update their own progress"
    ON lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS update_lesson_progress_timestamp ON lesson_progress;
CREATE TRIGGER update_lesson_progress_timestamp
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_progress_updated_at();

-- Comments for documentation
COMMENT ON TABLE video_access_logs IS 'Logs all video access attempts for security monitoring and piracy detection';
COMMENT ON TABLE lesson_progress IS 'Tracks student progress through lessons including completion status and watch time';
COMMENT ON COLUMN lessons.video_provider IS 'Video hosting provider: bunny, cloudflare, youtube';
COMMENT ON COLUMN lessons.video_id IS 'Provider-specific video ID or URL';
