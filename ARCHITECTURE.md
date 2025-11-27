# System Architecture: Frontend & Backend Separation

To allow multiple agents (or developers) to work in parallel, we strictly separate concerns.

## 1. The Frontend (Agent A)
**Responsibility**: UI, Animations, State, User Interaction.
**Tech**: Next.js (App Router), Tailwind CSS, Framer Motion.
**Location**: `app/`, `components/`

The Frontend **never** talks to the database directly. It uses the **Integration Layer**.

## 2. The Backend / Integration Layer (Agent B)
**Responsibility**: Data fetching, Security, Business Logic.
**Tech**: Supabase SDK, Server Actions.
**Location**: `lib/supabase/`, `actions/`

## How they Connect

### A. Reading Data (Client-Side)
For real-time features (Chat, Polls), the Frontend uses the `useSupabase` hook.

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage in Frontend:**
```tsx
const supabase = createClient()
const { data } = await supabase.from('courses').select('*')
```

### B. Writing Data (Server-Side)
For secure actions (Submitting Assignments, Grading), the Frontend calls a **Server Action**.

```typescript
// actions/submit-assignment.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function submitAssignment(formData: FormData) {
  const supabase = createClient()
  // ... backend logic ...
}
```

## Workflows
1.  **Frontend Agent**: Builds the UI components in `components/ui`. Mocks data initially.
2.  **Backend Agent**: Sets up the Database Schema and writes the functions in `actions/`.
3.  **Integration**: We replace the mock data with the real Server Actions.
