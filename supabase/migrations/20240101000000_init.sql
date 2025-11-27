-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text check (role in ('student', 'teacher', 'admin')) default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  thumbnail_url text,
  price numeric default 0,
  is_published boolean default false,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create modules table
create table modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lessons table
create table lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  title text not null,
  video_url text,
  is_free boolean default false,
  position integer not null,
  type text check (type in ('video', 'live', 'quiz')) default 'video',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create enrollments table (Implicit requirement for access control)
create table enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Create assignments table
create table assignments (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references lessons(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  file_url text not null,
  grade numeric,
  feedback text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table assignments enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Policies for Courses
create policy "Courses are viewable by everyone." on courses
  for select using (true);

create policy "Teachers can insert courses." on courses
  for insert with check (
    auth.uid() = teacher_id and 
    exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );

create policy "Teachers can update own courses." on courses
  for update using (auth.uid() = teacher_id);

create policy "Teachers can delete own courses." on courses
  for delete using (auth.uid() = teacher_id);

-- Policies for Modules
create policy "Modules are viewable by everyone." on modules
  for select using (true);

create policy "Teachers can insert modules for their courses." on modules
  for insert with check (
    exists (select 1 from courses where id = course_id and teacher_id = auth.uid())
  );

create policy "Teachers can update own modules." on modules
  for update using (
    exists (select 1 from courses where id = course_id and teacher_id = auth.uid())
  );

create policy "Teachers can delete own modules." on modules
  for delete using (
    exists (select 1 from courses where id = course_id and teacher_id = auth.uid())
  );

-- Policies for Lessons
create policy "Lessons are viewable by everyone." on lessons
  for select using (true);

create policy "Teachers can insert lessons for their courses." on lessons
  for insert with check (
    exists (
      select 1 from modules 
      join courses on modules.course_id = courses.id
      where modules.id = module_id and courses.teacher_id = auth.uid()
    )
  );

create policy "Teachers can update own lessons." on lessons
  for update using (
    exists (
      select 1 from modules 
      join courses on modules.course_id = courses.id
      where modules.id = module_id and courses.teacher_id = auth.uid()
    )
  );

create policy "Teachers can delete own lessons." on lessons
  for delete using (
    exists (
      select 1 from modules 
      join courses on modules.course_id = courses.id
      where modules.id = module_id and courses.teacher_id = auth.uid()
    )
  );

-- Policies for Enrollments
create policy "Users can view their own enrollments." on enrollments
  for select using (auth.uid() = user_id);

create policy "Teachers can view enrollments for their courses." on enrollments
  for select using (
    exists (select 1 from courses where id = course_id and teacher_id = auth.uid())
  );

create policy "Users can enroll themselves." on enrollments
  for insert with check (auth.uid() = user_id);

-- Policies for Assignments
create policy "Students can view their own assignments." on assignments
  for select using (auth.uid() = student_id);

create policy "Teachers can view assignments for their courses." on assignments
  for select using (
    exists (
      select 1 from lessons
      join modules on lessons.module_id = modules.id
      join courses on modules.course_id = courses.id
      where lessons.id = lesson_id and courses.teacher_id = auth.uid()
    )
  );

create policy "Students can create assignments." on assignments
  for insert with check (auth.uid() = student_id);

create policy "Teachers can update assignments (grade/feedback)." on assignments
  for update using (
    exists (
      select 1 from lessons
      join modules on lessons.module_id = modules.id
      join courses on modules.course_id = courses.id
      where lessons.id = lesson_id and courses.teacher_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'student');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
