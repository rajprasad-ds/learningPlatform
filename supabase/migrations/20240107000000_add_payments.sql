-- Create payments table
create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  amount numeric not null,
  currency text default 'USD' not null,
  status text check (status in ('pending', 'completed', 'failed', 'refunded')) default 'pending' not null,
  provider_id text, -- Stripe PaymentIntent ID
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table payments enable row level security;

-- Policies for Payments
create policy "Users can view their own payments." on payments
  for select using (auth.uid() = user_id);

create policy "Teachers can view payments for their courses." on payments
  for select using (
    exists (select 1 from courses where id = course_id and teacher_id = auth.uid())
  );

-- Only server-side actions (service role) should insert/update payments usually,
-- but for now we might need insert policy if we are doing it from client (not recommended)
-- or if we are using supabase-js from server actions which uses the user's auth context?
-- Actually, server actions run on the server but if we use `createClient` (standard one), it uses the user's session.
-- So we need an insert policy for the user to "create" a payment (initiate it), OR we use service role key in the action.
-- The plan said "purchaseCourse" server action.
-- If we use `createClient` in server action, it acts as the user.
-- So the user needs permission to insert a payment record?
-- Or better: The `purchaseCourse` action should probably use a `createAdminClient` or similar if we want to bypass RLS,
-- BUT usually we want RLS.
-- Let's allow users to insert their own payments for now (simulating "I am paying").
-- In a real Stripe flow, the webhook (service role) would insert/update.
-- For this "simulation", the user action will insert 'completed'.

create policy "Users can insert their own payments." on payments
  for insert with check (auth.uid() = user_id);

-- No update policy for users. Only admins/service role or maybe teachers (refunds?) but let's keep it simple.
