-- Create comments table for Q&A
create table comments (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references lessons(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  timestamp integer, -- Video timestamp in seconds
  parent_id uuid references comments(id) on delete cascade, -- For nested replies
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table comments enable row level security;

-- Policies
create policy "Comments are viewable by everyone." on comments
  for select using (true);

create policy "Authenticated users can insert comments." on comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments." on comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments." on comments
  for delete using (auth.uid() = user_id);

create policy "Teachers can delete comments in their courses." on comments
  for delete using (
    exists (
      select 1 from lessons
      join modules on lessons.module_id = modules.id
      join courses on modules.course_id = courses.id
      where lessons.id = comments.lesson_id and courses.teacher_id = auth.uid()
    )
  );
