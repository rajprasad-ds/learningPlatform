-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('student', 'teacher', 'admin');

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role app_role NOT NULL DEFAULT 'student';

-- Update existing profiles to have 'student' role (redundant due to default, but good for clarity)
UPDATE profiles SET role = 'student' WHERE role IS NULL;

-- Create a function to handle new user creation with default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'student' -- Default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy to allow users to read their own role
CREATE POLICY "Users can read own role" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create a policy to allow admins to read all roles (future proofing)
-- CREATE POLICY "Admins can read all roles" ON profiles
--   FOR SELECT
--   USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
