-- Add test data for learning platform

-- Insert a test course
INSERT INTO courses (id, title, description, thumbnail_url, price, is_published, teacher_id)
VALUES (
  '961d0b2a-035a-4d7f-b313-a22bf129b88a',
  'Complete Physics Mastery',
  'Master physics from fundamentals to advanced concepts with hands-on problems and video lessons.',
  NULL,
  0,
  true,
  (SELECT id FROM auth.users LIMIT 1) -- Uses first user as teacher
) ON CONFLICT (id) DO NOTHING;

-- Insert modules for the course
INSERT INTO modules (id, course_id, title, position)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '961d0b2a-035a-4d7f-b313-a22bf129b88a', 'Mechanics Fundamentals', 1),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '961d0b2a-035a-4d7f-b313-a22bf129b88a', 'Thermodynamics', 2),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '961d0b2a-035a-4d7f-b313-a22bf129b88a', 'Electromagnetism', 3)
ON CONFLICT DO NOTHING;

-- Insert lessons for each module (duration in seconds)
INSERT INTO lessons (id, module_id, title, type, position, duration, video_provider, video_id)
VALUES 
  -- Mechanics lessons
  ('5681e2e5-a2d5-4868-b016-e95b6adbd04d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Introduction to Mechanics', 'video', 1, 600, 'bunny', '782751f8-6b03-4221-a6aa-9dae6acc900f'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Newton''s Laws of Motion', 'video', 2, 720, NULL, NULL),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Work and Energy', 'video', 3, 680, NULL, NULL),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Momentum and Collisions', 'video', 4, 650, NULL, NULL),
  
  -- Thermodynamics lessons
  ('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Temperature and Heat', 'video', 1, 600, NULL, NULL),
  ('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Laws of Thermodynamics', 'video', 2, 750, NULL, NULL),
  ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Heat Engines', 'video', 3, 700, NULL, NULL),
  
  -- Electromagnetism lessons
  ('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Electric Fields', 'video', 1, 620, NULL, NULL),
  ('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Magnetic Fields', 'video', 2, 640, NULL, NULL),
  ('f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Electromagnetic Induction', 'video', 3, 680, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Enroll the current user in the course
INSERT INTO enrollments (user_id, course_id)
SELECT 
  id,
  '961d0b2a-035a-4d7f-b313-a22bf129b88a'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add some progress for the first lesson
INSERT INTO lesson_progress (user_id, lesson_id, course_id, progress, completed, last_watched_at)
SELECT 
  u.id,
  '5681e2e5-a2d5-4868-b016-e95b6adbd04d',
  '961d0b2a-035a-4d7f-b313-a22bf129b88a',
  100,
  true,
  NOW()
FROM auth.users u
LIMIT 1
ON CONFLICT (user_id, lesson_id) DO UPDATE
SET progress = 100, completed = true, last_watched_at = NOW();
