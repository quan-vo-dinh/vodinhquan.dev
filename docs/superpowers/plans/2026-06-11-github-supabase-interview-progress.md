# GitHub Supabase Interview Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GitHub login for any GitHub account and persist each user's Interview Practice progress in Supabase instead of only localStorage.

**Architecture:** Keep the question bank server-only and static in the existing `interview-practice` feature. Add Supabase Auth for GitHub OAuth sessions, Supabase Postgres tables protected by RLS for per-user progress/preferences, and a hybrid learning-state provider that uses localStorage for anonymous users and Supabase for signed-in users. The `/interview` UI remains public and compact, but the profile/rank/progress surfaces become user-aware.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase Auth, `@supabase/ssr`, `@supabase/supabase-js`, Supabase Postgres RLS, shadcn/ui primitives already in this repo.

---

## Evidence And Current State

- CodeGraph was used before writing this plan.
  - `codegraph status .` reports 65 indexed files, 465 nodes, 748 edges, up to date.
  - `codegraph context "create implementation plan for Supabase GitHub OAuth login and per-user interview progress storage; inspect app router interview feature localStorage profile card navbar package"` found the relevant App Router layout, navbar, icons, and UI primitives.
- Current `/interview` route exists at `src/app/interview/page.tsx`.
- Question data is already behind a server-only repository at `src/features/interview-practice/lib/question-repository.ts`.
- Learned/bookmarked progress currently lives in `window.localStorage` inside `src/features/interview-practice/components/local-learning-state.tsx`.
- Pinned categories currently live in `window.localStorage` inside `src/features/interview-practice/components/interview-practice-page.tsx`.
- The profile/rank card currently reads fixed owner data from `DATA.name`, `DATA.avatarUrl`, and `DATA.contact.social.GitHub.url`.
- `package.json` currently does not include Supabase packages.
- No `.env*`, `proxy.ts`, `middleware.ts`, or auth callback route exists in the repo.

## Context7 Documentation Used

Commands used for current docs:

```bash
npx ctx7@latest library Supabase "Next.js App Router Supabase Auth GitHub OAuth callback exchangeCodeForSession SSR RLS user progress plan"
npx ctx7@latest docs /supabase/ssr "Next.js App Router Supabase SSR GitHub OAuth signInWithOAuth auth callback exchangeCodeForSession proxy middleware cookies getUser"
npx ctx7@latest docs /supabase/supabase "Supabase Auth GitHub provider OAuth redirect URLs Postgres row level security auth.uid user owned progress table policies"
```

Relevant takeaways:

- Use `@supabase/ssr` `createServerClient` per request and pass cookie `getAll`/`setAll`.
- Call `supabase.auth.getUser()` for verified user identity checks.
- Complete OAuth by exchanging the `code` in `/auth/callback` with `exchangeCodeForSession`.
- Protect user-owned rows with RLS policies that compare `auth.uid()` to the row owner id.

## Your Current GitHub/Supabase Setup Assessment

What appears already correct from the details you shared:

- GitHub OAuth App exists: `Quan Portfolio Studio`.
- GitHub OAuth callback URL points to Supabase Auth callback:
  - `https://mqbeijnhwctgrxkqkgvh.supabase.co/auth/v1/callback`
- Supabase GitHub provider is enabled.
- Supabase GitHub provider has the same GitHub Client ID configured.
- Supabase project URL is known:
  - `https://mqbeijnhwctgrxkqkgvh.supabase.co`
- Supabase publishable key exists.
- Supabase Data API appears available for the project.

Manual configuration still required or must be verified by you:

- Do not commit GitHub Client Secret, Supabase secret key, or any real secret to this repo.
- Add local environment variables in `.env.local` yourself:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mqbeijnhwctgrxkqkgvh.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<copy Supabase publishable key from dashboard>"
```

- Do not add `SUPABASE_SECRET_KEY` for this feature. The client/server code should use the publishable key plus RLS.
- In Supabase Dashboard, verify Auth URL Configuration:
  - Site URL for local development: `http://localhost:3000`
  - Add Redirect URLs:

```txt
http://localhost:3000/auth/callback
https://vodinhquan.dev/auth/callback
```

- If production uses another deployed URL first, add that exact URL too:

```txt
https://<your-deployment-domain>/auth/callback
```

- If using Vercel preview deployments, add the preview redirect pattern supported by Supabase for your project setup.
- GitHub OAuth App homepage URL can stay `http://localhost:3000` for local-only testing, but should become the production homepage before public launch:

```txt
https://vodinhquan.dev
```

- Run the SQL schema/RLS migration in Supabase SQL Editor, or link Supabase CLI before applying it.
- If the pasted secret values were shared anywhere public, rotate the GitHub Client Secret and Supabase secret key. The implementation plan does not need the secret key.

## File Structure Plan

Create:

- `src/lib/supabase/browser.ts` - Browser Supabase client for client components.
- `src/lib/supabase/server.ts` - Server Supabase client for server components, route handlers, and server actions.
- `src/lib/supabase/proxy.ts` - Shared cookie/session refresh logic for `proxy.ts`.
- `src/lib/supabase/types.ts` - Minimal typed Supabase table definitions used by this feature.
- `proxy.ts` - Next.js request proxy that refreshes Supabase auth cookies.
- `src/app/auth/callback/route.ts` - OAuth callback route that exchanges code for session.
- `src/app/auth/sign-in/github/route.ts` - Route that starts GitHub OAuth.
- `src/app/auth/sign-out/route.ts` - Route that signs out.
- `src/app/auth/auth-code-error/page.tsx` - Small auth error screen.
- `supabase/migrations/202606110001_interview_progress.sql` - SQL schema and RLS policies.
- `src/features/auth/types.ts` - App-facing viewer type.
- `src/features/auth/lib/get-current-viewer.ts` - Server helper for reading current GitHub-backed viewer.
- `src/features/auth/components/sign-in-with-github-button.tsx` - Reusable GitHub login button.
- `src/features/auth/components/sign-out-button.tsx` - Reusable sign-out button.
- `src/features/interview-practice/lib/learning-state-types.ts` - Shared learning-state DTOs.
- `src/features/interview-practice/lib/learning-state-repository.ts` - Server-only Supabase reads for progress/preferences.
- `src/features/interview-practice/actions/learning-state-actions.ts` - Server actions for toggle/sync/prefs.
- `src/features/interview-practice/components/interview-learning-state-provider.tsx` - Client provider that bridges anonymous local state and authenticated Supabase state.
- `src/features/interview-practice/components/interview-profile-card.tsx` - User-aware profile/rank card.
- `src/features/interview-practice/components/learning-sync-banner.tsx` - Post-login local-to-account sync prompt.

Modify:

- `package.json` and `pnpm-lock.yaml` - Add Supabase dependencies.
- `.env.example` - Document required public env vars without real secrets.
- `src/app/interview/page.tsx` - Load viewer and initial learning state server-side.
- `src/features/interview-practice/components/interview-practice-page.tsx` - Wrap content in provider, pass viewer, remove direct profile hardcoding, move pinned category localStorage into provider.
- `src/features/interview-practice/components/question-list.tsx` - Use new learning-state hook and synced wording.
- `src/features/interview-practice/components/flashcard-deck.tsx` - Use new learning-state hook.
- `src/features/interview-practice/components/progress-summary.tsx` - Use new learning-state hook and mode-aware copy.
- `src/features/interview-practice/components/category-progress-vertical.tsx` - Use new learning-state hook.
- `src/features/interview-practice/components/local-learning-state.tsx` - Either keep as anonymous storage helper or replace with a narrower local storage module.

## Data Model

Use Supabase Auth as the identity source. `auth.users.id` is the canonical user id.

Progress tables should reference static `question_id` values from `questions.json`. Do not move the question bank into Supabase for this feature.

### SQL Migration

Create `supabase/migrations/202606110001_interview_progress.sql` with:

```sql
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  display_name text,
  avatar_url text,
  profile_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_question_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id integer not null,
  learned_at timestamptz,
  bookmarked_at timestamptz,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id),
  constraint interview_question_progress_has_state check (
    learned_at is not null
    or bookmarked_at is not null
    or last_reviewed_at is not null
  )
);

create table if not exists public.interview_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pinned_categories text[] not null default '{}',
  preferred_locale text not null default 'vi',
  preferred_mode text not null default 'list',
  last_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_user_preferences_locale_check check (preferred_locale in ('vi', 'en')),
  constraint interview_user_preferences_mode_check check (preferred_mode in ('list', 'flashcards'))
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    github_username,
    display_name,
    avatar_url,
    profile_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    case
      when coalesce(new.raw_user_meta_data->>'user_name', '') <> ''
      then 'https://github.com/' || (new.raw_user_meta_data->>'user_name')
      else null
    end
  )
  on conflict (id) do update
  set
    github_username = excluded.github_username,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    profile_url = excluded.profile_url,
    updated_at = now();

  insert into public.interview_user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_interview_question_progress_updated_at on public.interview_question_progress;
create trigger set_interview_question_progress_updated_at
before update on public.interview_question_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_interview_user_preferences_updated_at on public.interview_user_preferences;
create trigger set_interview_user_preferences_updated_at
before update on public.interview_user_preferences
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.interview_question_progress enable row level security;
alter table public.interview_user_preferences enable row level security;

drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile."
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile."
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can view their own interview progress." on public.interview_question_progress;
create policy "Users can view their own interview progress."
on public.interview_question_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own interview progress." on public.interview_question_progress;
create policy "Users can insert their own interview progress."
on public.interview_question_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own interview progress." on public.interview_question_progress;
create policy "Users can update their own interview progress."
on public.interview_question_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own interview progress." on public.interview_question_progress;
create policy "Users can delete their own interview progress."
on public.interview_question_progress for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own interview preferences." on public.interview_user_preferences;
create policy "Users can view their own interview preferences."
on public.interview_user_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own interview preferences." on public.interview_user_preferences;
create policy "Users can insert their own interview preferences."
on public.interview_user_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own interview preferences." on public.interview_user_preferences;
create policy "Users can update their own interview preferences."
on public.interview_user_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

Manual verification query after applying SQL:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'interview_question_progress',
    'interview_user_preferences'
  )
order by table_name;
```

Expected rows:

```txt
interview_question_progress
interview_user_preferences
profiles
```

## Implementation Tasks

### Task 1: Add Supabase Dependencies And Env Template

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.env.example`

- [ ] **Step 1: Install Supabase packages**

Run:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

Expected:

```txt
dependencies:
+ @supabase/supabase-js
+ @supabase/ssr
```

- [ ] **Step 2: Create `.env.example`**

Create:

```bash
touch .env.example
```

Content:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mqbeijnhwctgrxkqkgvh.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<copy-from-supabase-dashboard>"
```

- [ ] **Step 3: User manual env setup**

The user must create `.env.local` with real values:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mqbeijnhwctgrxkqkgvh.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<real-publishable-key>"
```

Do not write the GitHub Client Secret or Supabase secret key into `.env.local` for this feature.

- [ ] **Step 4: Verify package install**

Run:

```bash
pnpm lint
```

Expected: lint runs without dependency resolution errors.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "chore: add supabase auth dependencies"
```

### Task 2: Add Supabase SQL Schema And RLS

**Files:**

- Create: `supabase/migrations/202606110001_interview_progress.sql`

- [ ] **Step 1: Create migration file**

Run:

```bash
mkdir -p supabase/migrations
touch supabase/migrations/202606110001_interview_progress.sql
```

- [ ] **Step 2: Paste SQL migration**

Paste the SQL from the `Data Model` section into:

```txt
supabase/migrations/202606110001_interview_progress.sql
```

- [ ] **Step 3: User manual database apply**

Choose one path:

```txt
Path A: Supabase Dashboard
1. Open Supabase SQL Editor.
2. Paste the migration SQL.
3. Run it against project mqbeijnhwctgrxkqkgvh.

Path B: Supabase CLI
1. Link this repo to the Supabase project.
2. Apply the migration.
```

Default for this repo should be Path A unless Supabase CLI has already been linked.

- [ ] **Step 4: Verify schema**

Run in Supabase SQL Editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'interview_question_progress',
    'interview_user_preferences'
  )
order by table_name;
```

Expected: three rows listed in alphabetical order.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202606110001_interview_progress.sql
git commit -m "feat: add interview progress schema"
```

### Task 3: Add Supabase Client Helpers And Proxy

**Files:**

- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `proxy.ts`

- [ ] **Step 1: Create minimal database types**

Create `src/lib/supabase/types.ts`:

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          profile_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          github_username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          profile_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          github_username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          profile_url?: string | null;
          updated_at?: string;
        };
      };
      interview_question_progress: {
        Row: {
          user_id: string;
          question_id: number;
          learned_at: string | null;
          bookmarked_at: string | null;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          question_id: number;
          learned_at?: string | null;
          bookmarked_at?: string | null;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          learned_at?: string | null;
          bookmarked_at?: string | null;
          last_reviewed_at?: string | null;
          updated_at?: string;
        };
      };
      interview_user_preferences: {
        Row: {
          user_id: string;
          pinned_categories: string[];
          preferred_locale: "vi" | "en";
          preferred_mode: "list" | "flashcards";
          last_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          pinned_categories?: string[];
          preferred_locale?: "vi" | "en";
          preferred_mode?: "list" | "flashcards";
          last_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pinned_categories?: string[];
          preferred_locale?: "vi" | "en";
          preferred_mode?: "list" | "flashcards";
          last_category?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
```

- [ ] **Step 2: Create browser client**

Create `src/lib/supabase/browser.ts`:

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

- [ ] **Step 3: Create server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies.
            // The request proxy handles refresh persistence.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create proxy helper**

Create `src/lib/supabase/proxy.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./types";

export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

- [ ] **Step 5: Create root proxy**

Create `proxy.ts`:

```ts
import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 6: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass without missing env errors when `.env.local` exists.

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase proxy.ts
git commit -m "feat: add supabase ssr clients"
```

### Task 4: Add Auth Routes

**Files:**

- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/sign-in/github/route.ts`
- Create: `src/app/auth/sign-out/route.ts`
- Create: `src/app/auth/auth-code-error/page.tsx`

- [ ] **Step 1: Add GitHub sign-in route**

Create `src/app/auth/sign-in/github/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/interview";
  }

  if (value.startsWith("//")) {
    return "/interview";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
  }

  return NextResponse.redirect(data.url);
}
```

- [ ] **Step 2: Add callback route**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/interview";
  }

  if (value.startsWith("//")) {
    return "/interview";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
}
```

- [ ] **Step 3: Add sign-out route**

Create `src/app/auth/sign-out/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(`${requestUrl.origin}/interview`, {
    status: 303,
  });
}
```

- [ ] **Step 4: Add auth error page**

Create `src/app/auth/auth-code-error/page.tsx`:

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Authentication
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          GitHub sign-in could not be completed
        </h1>
        <p className="text-sm text-muted-foreground">
          Please try signing in again from the interview practice page.
        </p>
      </div>
      <Button asChild>
        <Link href="/interview">Back to Interview Practice</Link>
      </Button>
    </main>
  );
}
```

- [ ] **Step 5: User manual OAuth config verification**

Before testing this route, verify Supabase Auth Redirect URLs include:

```txt
http://localhost:3000/auth/callback
https://vodinhquan.dev/auth/callback
```

- [ ] **Step 6: Verify route build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/auth
git commit -m "feat: add github auth routes"
```

### Task 5: Add Viewer Helpers And Auth Buttons

**Files:**

- Create: `src/features/auth/types.ts`
- Create: `src/features/auth/lib/get-current-viewer.ts`
- Create: `src/features/auth/components/sign-in-with-github-button.tsx`
- Create: `src/features/auth/components/sign-out-button.tsx`

- [ ] **Step 1: Add viewer type**

Create `src/features/auth/types.ts`:

```ts
export type CurrentViewer = {
  id: string;
  githubUsername: string | null;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string | null;
};
```

- [ ] **Step 2: Add server viewer helper**

Create `src/features/auth/lib/get-current-viewer.ts`:

```ts
import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { CurrentViewer } from "../types";

function getMetadataString(
  metadata: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

export async function getCurrentViewer(): Promise<CurrentViewer | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("github_username, display_name, avatar_url, profile_url")
    .eq("id", user.id)
    .maybeSingle();

  const metadata = user.user_metadata;
  const githubUsername =
    profile?.github_username ??
    getMetadataString(metadata, ["user_name", "preferred_username"]);
  const displayName =
    profile?.display_name ??
    getMetadataString(metadata, ["full_name", "name", "user_name"]) ??
    "GitHub learner";
  const avatarUrl =
    profile?.avatar_url ??
    getMetadataString(metadata, ["avatar_url", "picture"]);
  const profileUrl =
    profile?.profile_url ??
    (githubUsername ? `https://github.com/${githubUsername}` : null);

  return {
    id: user.id,
    githubUsername,
    displayName,
    avatarUrl,
    profileUrl,
  };
}
```

- [ ] **Step 3: Add sign-in button**

Create `src/features/auth/components/sign-in-with-github-button.tsx`:

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

type SignInWithGitHubButtonProps = {
  next?: string;
};

export function SignInWithGitHubButton({
  next = "/interview",
}: SignInWithGitHubButtonProps) {
  return (
    <Button asChild size="sm" variant="outline">
      <Link href={`/auth/sign-in/github?next=${encodeURIComponent(next)}`}>
        <Icons.github className="mr-2 size-4" aria-hidden />
        Sign in with GitHub
      </Link>
    </Button>
  );
}
```

- [ ] **Step 4: Add sign-out button**

Create `src/features/auth/components/sign-out-button.tsx`:

```tsx
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/auth/sign-out" method="post">
      <Button type="submit" size="sm" variant="ghost">
        Sign out
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth
git commit -m "feat: add github viewer helpers"
```

### Task 6: Add Server-Side Learning State Repository

**Files:**

- Create: `src/features/interview-practice/lib/learning-state-types.ts`
- Create: `src/features/interview-practice/lib/learning-state-repository.ts`

- [ ] **Step 1: Add learning state types**

Create `src/features/interview-practice/lib/learning-state-types.ts`:

```ts
export type InterviewLearningStateSnapshot = {
  learnedIds: number[];
  bookmarkedIds: number[];
  pinnedCategories: string[];
  isAuthenticated: boolean;
};

export type InterviewLearningStateSets = {
  learnedIds: Set<number>;
  bookmarkedIds: Set<number>;
  pinnedCategories: string[];
  isAuthenticated: boolean;
  isReady: boolean;
};
```

- [ ] **Step 2: Add repository**

Create `src/features/interview-practice/lib/learning-state-repository.ts`:

```ts
import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { InterviewLearningStateSnapshot } from "./learning-state-types";

export const emptyInterviewLearningState: InterviewLearningStateSnapshot = {
  learnedIds: [],
  bookmarkedIds: [],
  pinnedCategories: [],
  isAuthenticated: false,
};

export async function getCurrentUserInterviewLearningState(): Promise<InterviewLearningStateSnapshot> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyInterviewLearningState;
  }

  const [{ data: progressRows }, { data: preferences }] = await Promise.all([
    supabase
      .from("interview_question_progress")
      .select("question_id, learned_at, bookmarked_at")
      .eq("user_id", user.id),
    supabase
      .from("interview_user_preferences")
      .select("pinned_categories")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    learnedIds:
      progressRows
        ?.filter((row) => row.learned_at !== null)
        .map((row) => row.question_id) ?? [],
    bookmarkedIds:
      progressRows
        ?.filter((row) => row.bookmarked_at !== null)
        .map((row) => row.question_id) ?? [],
    pinnedCategories: preferences?.pinned_categories ?? [],
    isAuthenticated: true,
  };
}
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/interview-practice/lib/learning-state-types.ts src/features/interview-practice/lib/learning-state-repository.ts
git commit -m "feat: read interview learning state"
```

### Task 7: Add Learning State Server Actions

**Files:**

- Create: `src/features/interview-practice/actions/learning-state-actions.ts`

- [ ] **Step 1: Add server actions**

Create `src/features/interview-practice/actions/learning-state-actions.ts`:

```ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ToggleQuestionStateInput = {
  questionId: number;
  enabled: boolean;
};

type SyncLocalStateInput = {
  learnedIds: number[];
  bookmarkedIds: number[];
  pinnedCategories: string[];
};

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function setQuestionLearned(input: ToggleQuestionStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("interview_question_progress").upsert({
    user_id: userId,
    question_id: input.questionId,
    learned_at: input.enabled ? now : null,
    last_reviewed_at: input.enabled ? now : null,
  });

  return { ok: !error, reason: error?.message ?? null };
}

export async function setQuestionBookmarked(input: ToggleQuestionStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const { error } = await supabase.from("interview_question_progress").upsert({
    user_id: userId,
    question_id: input.questionId,
    bookmarked_at: input.enabled ? new Date().toISOString() : null,
  });

  return { ok: !error, reason: error?.message ?? null };
}

export async function setPinnedCategories(pinnedCategories: string[]) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const { error } = await supabase.from("interview_user_preferences").upsert({
    user_id: userId,
    pinned_categories: pinnedCategories,
  });

  return { ok: !error, reason: error?.message ?? null };
}

export async function syncLocalLearningState(input: SyncLocalStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const now = new Date().toISOString();
  const questionIds = Array.from(
    new Set([...input.learnedIds, ...input.bookmarkedIds])
  );

  const progressRows = questionIds.map((questionId) => ({
    user_id: userId,
    question_id: questionId,
    learned_at: input.learnedIds.includes(questionId) ? now : null,
    bookmarked_at: input.bookmarkedIds.includes(questionId) ? now : null,
    last_reviewed_at: input.learnedIds.includes(questionId) ? now : null,
  }));

  const progressResult =
    progressRows.length > 0
      ? await supabase.from("interview_question_progress").upsert(progressRows)
      : { error: null };

  const preferencesResult = await supabase
    .from("interview_user_preferences")
    .upsert({
      user_id: userId,
      pinned_categories: input.pinnedCategories,
    });

  const error = progressResult.error ?? preferencesResult.error;

  return { ok: !error, reason: error?.message ?? null };
}
```

- [ ] **Step 2: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/interview-practice/actions/learning-state-actions.ts
git commit -m "feat: add interview learning actions"
```

### Task 8: Replace Local-Only Hook With Hybrid Provider

**Files:**

- Create: `src/features/interview-practice/components/interview-learning-state-provider.tsx`
- Modify: `src/features/interview-practice/components/local-learning-state.tsx`

- [ ] **Step 1: Keep local storage helpers available**

Modify `src/features/interview-practice/components/local-learning-state.tsx` so it exports storage keys and pure helpers in addition to the current hook:

```ts
export const LEARNED_STORAGE_KEY = "interview-practice:v1:learned";
export const BOOKMARK_STORAGE_KEY = "interview-practice:v1:bookmarks";
export const PINNED_CATEGORIES_STORAGE_KEY =
  "interview-practice:v1:pinned-categories";
```

Add helpers:

```ts
export function readLocalNumberArray(key: string) {
  return Array.from(readNumberSet(key));
}

export function writeLocalNumberArray(key: string, ids: number[]) {
  writeNumberSet(key, new Set(ids));
}

export function readLocalStringArray(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeLocalStringArray(key: string, values: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
    queueMicrotask(() => {
      window.dispatchEvent(new Event(LOCAL_LEARNING_STATE_EVENT));
    });
  } catch {
    return;
  }
}
```

- [ ] **Step 2: Add hybrid provider**

Create `src/features/interview-practice/components/interview-learning-state-provider.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import {
  setPinnedCategories as persistPinnedCategories,
  setQuestionBookmarked,
  setQuestionLearned,
  syncLocalLearningState,
} from "../actions/learning-state-actions";
import type { InterviewLearningStateSnapshot } from "../lib/learning-state-types";
import {
  BOOKMARK_STORAGE_KEY,
  LEARNED_STORAGE_KEY,
  PINNED_CATEGORIES_STORAGE_KEY,
  readLocalNumberArray,
  readLocalStringArray,
  writeLocalNumberArray,
  writeLocalStringArray,
} from "./local-learning-state";

type InterviewLearningStateContextValue = {
  bookmarkedIds: Set<number>;
  learnedIds: Set<number>;
  pinnedCategories: string[];
  isAuthenticated: boolean;
  isPending: boolean;
  isReady: boolean;
  hasLocalProgressToSync: boolean;
  toggleBookmark: (id: number) => void;
  toggleLearned: (id: number) => void;
  togglePinCategory: (category: string) => void;
  syncBrowserProgress: () => void;
};

const InterviewLearningStateContext =
  createContext<InterviewLearningStateContextValue | null>(null);

type InterviewLearningStateProviderProps = {
  children: ReactNode;
  initialState: InterviewLearningStateSnapshot;
};

function toSet(ids: number[]) {
  return new Set(ids);
}

export function InterviewLearningStateProvider({
  children,
  initialState,
}: InterviewLearningStateProviderProps) {
  const [isPending, startTransition] = useTransition();
  const [learnedIds, setLearnedIds] = useState(() => toSet(initialState.learnedIds));
  const [bookmarkedIds, setBookmarkedIds] = useState(() =>
    toSet(initialState.bookmarkedIds)
  );
  const [pinnedCategories, setPinnedCategoriesState] = useState(
    initialState.pinnedCategories
  );
  const [hasLocalProgressToSync, setHasLocalProgressToSync] = useState(() => {
    if (!initialState.isAuthenticated || typeof window === "undefined") {
      return false;
    }

    return (
      readLocalNumberArray(LEARNED_STORAGE_KEY).length > 0 ||
      readLocalNumberArray(BOOKMARK_STORAGE_KEY).length > 0 ||
      readLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY).length > 0
    );
  });

  const persistLocalLearned = useCallback((nextIds: Set<number>) => {
    writeLocalNumberArray(LEARNED_STORAGE_KEY, Array.from(nextIds));
  }, []);

  const persistLocalBookmarks = useCallback((nextIds: Set<number>) => {
    writeLocalNumberArray(BOOKMARK_STORAGE_KEY, Array.from(nextIds));
  }, []);

  const toggleLearned = useCallback(
    (id: number) => {
      setLearnedIds((current) => {
        const next = new Set(current);
        const enabled = !next.has(id);

        if (enabled) {
          next.add(id);
        } else {
          next.delete(id);
        }

        if (initialState.isAuthenticated) {
          startTransition(() => {
            void setQuestionLearned({ questionId: id, enabled });
          });
        } else {
          persistLocalLearned(next);
        }

        return next;
      });
    },
    [initialState.isAuthenticated, persistLocalLearned]
  );

  const toggleBookmark = useCallback(
    (id: number) => {
      setBookmarkedIds((current) => {
        const next = new Set(current);
        const enabled = !next.has(id);

        if (enabled) {
          next.add(id);
        } else {
          next.delete(id);
        }

        if (initialState.isAuthenticated) {
          startTransition(() => {
            void setQuestionBookmarked({ questionId: id, enabled });
          });
        } else {
          persistLocalBookmarks(next);
        }

        return next;
      });
    },
    [initialState.isAuthenticated, persistLocalBookmarks]
  );

  const togglePinCategory = useCallback(
    (category: string) => {
      setPinnedCategoriesState((current) => {
        const next = current.includes(category)
          ? current.filter((name) => name !== category)
          : [...current, category];

        if (initialState.isAuthenticated) {
          startTransition(() => {
            void persistPinnedCategories(next);
          });
        } else {
          writeLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY, next);
        }

        return next;
      });
    },
    [initialState.isAuthenticated]
  );

  const syncBrowserProgress = useCallback(() => {
    const localLearnedIds = readLocalNumberArray(LEARNED_STORAGE_KEY);
    const localBookmarkedIds = readLocalNumberArray(BOOKMARK_STORAGE_KEY);
    const localPinnedCategories = readLocalStringArray(
      PINNED_CATEGORIES_STORAGE_KEY
    );

    startTransition(() => {
      void syncLocalLearningState({
        learnedIds: localLearnedIds,
        bookmarkedIds: localBookmarkedIds,
        pinnedCategories: localPinnedCategories,
      }).then((result) => {
        if (!result.ok) {
          return;
        }

        setLearnedIds((current) => new Set([...current, ...localLearnedIds]));
        setBookmarkedIds(
          (current) => new Set([...current, ...localBookmarkedIds])
        );
        setPinnedCategoriesState((current) =>
          Array.from(new Set([...current, ...localPinnedCategories]))
        );
        writeLocalNumberArray(LEARNED_STORAGE_KEY, []);
        writeLocalNumberArray(BOOKMARK_STORAGE_KEY, []);
        writeLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY, []);
        setHasLocalProgressToSync(false);
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      bookmarkedIds,
      hasLocalProgressToSync,
      isAuthenticated: initialState.isAuthenticated,
      isPending,
      isReady: true,
      learnedIds,
      pinnedCategories,
      syncBrowserProgress,
      toggleBookmark,
      toggleLearned,
      togglePinCategory,
    }),
    [
      bookmarkedIds,
      hasLocalProgressToSync,
      initialState.isAuthenticated,
      isPending,
      learnedIds,
      pinnedCategories,
      syncBrowserProgress,
      toggleBookmark,
      toggleLearned,
      togglePinCategory,
    ]
  );

  return (
    <InterviewLearningStateContext.Provider value={value}>
      {children}
    </InterviewLearningStateContext.Provider>
  );
}

export function useInterviewLearningState() {
  const value = useContext(InterviewLearningStateContext);

  if (!value) {
    throw new Error(
      "useInterviewLearningState must be used within InterviewLearningStateProvider"
    );
  }

  return value;
}
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: build may fail until consumers are switched in the next task if unused exports are restricted by lint. If it fails only due to unused code, continue to Task 9 before final verification.

- [ ] **Step 4: Commit**

```bash
git add src/features/interview-practice/components/local-learning-state.tsx src/features/interview-practice/components/interview-learning-state-provider.tsx
git commit -m "feat: add hybrid interview learning provider"
```

### Task 9: Wire Server State Into Interview Page

**Files:**

- Modify: `src/app/interview/page.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Load viewer and learning state in route**

Modify `src/app/interview/page.tsx` imports:

```ts
import { getCurrentViewer } from "@/features/auth/lib/get-current-viewer";
import { getCurrentUserInterviewLearningState } from "@/features/interview-practice/lib/learning-state-repository";
```

Inside `InterviewPage`, add:

```ts
const [viewer, learningState] = await Promise.all([
  getCurrentViewer(),
  getCurrentUserInterviewLearningState(),
]);
```

Pass props:

```tsx
<InterviewPracticePage
  categories={categories}
  categoryQuestionIds={categoryQuestionIds}
  filterState={state}
  initialLearningState={learningState}
  questions={questions}
  subcategories={subcategories}
  totalQuestions={getInterviewQuestionTotal()}
  viewer={viewer}
/>
```

- [ ] **Step 2: Update page props**

In `src/features/interview-practice/components/interview-practice-page.tsx`, import:

```ts
import type { CurrentViewer } from "@/features/auth/types";
import type { InterviewLearningStateSnapshot } from "../lib/learning-state-types";
import {
  InterviewLearningStateProvider,
  useInterviewLearningState,
} from "./interview-learning-state-provider";
```

Update `InterviewPracticePageProps`:

```ts
type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionIds: Record<string, number[]>;
  filterState: InterviewFilterState;
  initialLearningState: InterviewLearningStateSnapshot;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
  viewer: CurrentViewer | null;
};
```

Wrap the returned UI:

```tsx
return (
  <InterviewLearningStateProvider initialState={initialLearningState}>
    <InterviewPracticePageContent
      categories={categories}
      categoryQuestionIds={categoryQuestionIds}
      filterState={filterState}
      questions={questions}
      subcategories={subcategories}
      totalQuestions={totalQuestions}
      viewer={viewer}
    />
  </InterviewLearningStateProvider>
);
```

Move the current component body into a new internal `InterviewPracticePageContent` with the same props except `initialLearningState`.

- [ ] **Step 3: Replace local hook usage in page**

Replace:

```ts
const { isReady, learnedIds } = useLocalLearningState();
```

With:

```ts
const {
  isReady,
  learnedIds,
  pinnedCategories,
  togglePinCategory,
} = useInterviewLearningState();
```

Remove the local `pinnedCategories` `useState`, the localStorage hydration effect for pinned categories, and the old `togglePinCategory` callback.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass after all imports are corrected.

- [ ] **Step 5: Commit**

```bash
git add src/app/interview/page.tsx src/features/interview-practice/components/interview-practice-page.tsx
git commit -m "feat: load interview learning state from server"
```

### Task 10: Replace Hook Consumers

**Files:**

- Modify: `src/features/interview-practice/components/question-list.tsx`
- Modify: `src/features/interview-practice/components/flashcard-deck.tsx`
- Modify: `src/features/interview-practice/components/progress-summary.tsx`
- Modify: `src/features/interview-practice/components/category-progress-vertical.tsx`

- [ ] **Step 1: Replace imports**

In each file, replace:

```ts
import { useLocalLearningState } from "./local-learning-state";
```

With:

```ts
import { useInterviewLearningState } from "./interview-learning-state-provider";
```

- [ ] **Step 2: Replace hook calls**

Replace:

```ts
useLocalLearningState()
```

With:

```ts
useInterviewLearningState()
```

- [ ] **Step 3: Update user-facing copy**

In `question-list.tsx`, replace tooltip copy:

```tsx
<TooltipContent>Track your local progress</TooltipContent>
```

With:

```tsx
<TooltipContent>Track your progress</TooltipContent>
```

Replace:

```tsx
<TooltipContent>Save this question locally</TooltipContent>
```

With:

```tsx
<TooltipContent>Save this question</TooltipContent>
```

In `progress-summary.tsx`, read `isAuthenticated` from the hook:

```ts
const { bookmarkedIds, isAuthenticated, isReady, learnedIds } =
  useInterviewLearningState();
```

Replace:

```tsx
<p className="text-sm font-medium">Local progress</p>
```

With:

```tsx
<p className="text-sm font-medium">
  {isAuthenticated ? "Synced progress" : "Local progress"}
</p>
```

Replace:

```tsx
Stored only in this browser for now.
```

With:

```tsx
{isAuthenticated
  ? "Saved to your GitHub-backed account."
  : "Stored only in this browser until you sign in."}
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/interview-practice/components/question-list.tsx src/features/interview-practice/components/flashcard-deck.tsx src/features/interview-practice/components/progress-summary.tsx src/features/interview-practice/components/category-progress-vertical.tsx
git commit -m "feat: use synced interview learning state"
```

### Task 11: Extract User-Aware Interview Profile Card

**Files:**

- Create: `src/features/interview-practice/components/interview-profile-card.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create profile card component**

Move the existing profile card JSX from `interview-practice-page.tsx` into `interview-profile-card.tsx`.

Component contract:

```ts
type InterviewProfileCardProps = {
  categoryProgress: number;
  learnedCount: number;
  viewer: CurrentViewer | null;
};
```

Display rules:

```ts
const displayName = viewer?.displayName ?? "Guest learner";
const avatarUrl = viewer?.avatarUrl ?? null;
const initials = displayName
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join("") || "GL";
```

Signed-in GitHub link:

```tsx
{viewer?.profileUrl ? (
  <Link
    href={viewer.profileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    aria-label={`Visit ${displayName} GitHub profile`}
  >
    <Icons.github className="size-3.5" aria-hidden />
    <span>{viewer.githubUsername ?? "GitHub Profile"}</span>
  </Link>
) : (
  <SignInWithGitHubButton />
)}
```

Signed-in sign-out:

```tsx
{viewer ? <SignOutButton /> : null}
```

- [ ] **Step 2: Replace inline card in interview page**

In `interview-practice-page.tsx`, replace the inline `CardContainer` profile block with:

```tsx
<InterviewProfileCard
  categoryProgress={categoryProgress}
  learnedCount={categoryLearnedCount}
  viewer={viewer}
/>
```

- [ ] **Step 3: Ensure fixed owner name is gone from signed-in state**

Search:

```bash
rg -n "DATA\\.name|DATA\\.avatarUrl|Vo Dinh Quan|GitHub Profile" src/features/interview-practice
```

Expected:

- `DATA.name` and `DATA.avatarUrl` should not be used by the interview profile card.
- The public resume/home page can still use owner data.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/interview-practice/components/interview-profile-card.tsx src/features/interview-practice/components/interview-practice-page.tsx
git commit -m "feat: show github viewer in interview profile"
```

### Task 12: Add Local Progress Sync Banner

**Files:**

- Create: `src/features/interview-practice/components/learning-sync-banner.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create banner**

Create `src/features/interview-practice/components/learning-sync-banner.tsx`:

```tsx
"use client";

import { CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useInterviewLearningState } from "./interview-learning-state-provider";

export function LearningSyncBanner() {
  const {
    hasLocalProgressToSync,
    isAuthenticated,
    isPending,
    syncBrowserProgress,
  } = useInterviewLearningState();

  if (!isAuthenticated || !hasLocalProgressToSync) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">Browser progress found</p>
        <p className="text-xs opacity-80">
          Sync the progress saved before sign-in into this GitHub account.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={syncBrowserProgress}
        disabled={isPending}
      >
        <CloudUpload className="mr-2 size-4" />
        {isPending ? "Syncing" : "Sync to account"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Render banner**

In `interview-practice-page.tsx`, render the banner above `ProgressSummary`:

```tsx
<LearningSyncBanner />
```

- [ ] **Step 3: Verify**

Manual test:

1. Sign out.
2. Mark one question learned.
3. Bookmark one question.
4. Sign in with GitHub.
5. Confirm banner appears.
6. Click sync.
7. Reload.
8. Confirm progress remains and banner disappears.

- [ ] **Step 4: Run verification**

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/interview-practice/components/learning-sync-banner.tsx src/features/interview-practice/components/interview-practice-page.tsx
git commit -m "feat: sync browser interview progress"
```

### Task 13: End-To-End Manual QA

**Files:**

- No code files unless QA reveals a defect.

- [ ] **Step 1: Start dev server**

Run:

```bash
pnpm dev
```

Expected:

```txt
Ready
Local: http://localhost:3000
```

- [ ] **Step 2: Anonymous flow**

Open:

```txt
http://localhost:3000/interview
```

Verify:

- Page loads.
- Profile card says `Guest learner`.
- `Sign in with GitHub` appears.
- Mark learned works.
- Bookmark works.
- Pinned category works.
- Reload keeps anonymous local progress.

- [ ] **Step 3: GitHub sign-in flow**

Click:

```txt
Sign in with GitHub
```

Verify:

- GitHub OAuth consent appears if needed.
- Supabase callback completes.
- Browser returns to `/interview`.
- Profile card shows the signed-in user's GitHub display name/avatar/link.
- It does not show fixed owner name for signed-in users.

- [ ] **Step 4: Synced progress flow**

Verify:

- Mark learned writes to Supabase.
- Bookmark writes to Supabase.
- Pinned category writes to Supabase.
- Reload keeps progress.
- Signing in from a different browser with the same GitHub account shows the same progress.

- [ ] **Step 5: User isolation flow**

Use a second GitHub account if available.

Verify:

- The second account does not see the first account's learned/bookmarked questions.
- Supabase table rows have different `user_id` values.
- RLS prevents cross-user reads when querying through the app session.

- [ ] **Step 6: Sign-out flow**

Verify:

- Sign out returns to `/interview`.
- Profile card returns to `Guest learner`.
- Authenticated Supabase progress is no longer shown as the active state.

- [ ] **Step 7: Production config check**

Before production deploy, verify hosting environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Verify Supabase Auth Redirect URLs include production:

```txt
https://vodinhquan.dev/auth/callback
```

- [ ] **Step 8: Final build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass.

- [ ] **Step 9: Commit QA fixes**

If no fixes were needed, skip this commit. If fixes were needed:

```bash
git add <changed-files>
git commit -m "fix: polish github interview auth flow"
```

## Security Notes

- Use the Supabase publishable key with RLS for this feature.
- Do not use the Supabase secret key in client components, route handlers, or server actions for normal user progress.
- Do not store GitHub access tokens in app tables.
- Do not put the GitHub Client Secret in source control.
- RLS policies are required before any real user signs in.
- `profiles` is private to the owner row in this plan. If public profiles are desired, introduce that explicitly in a separate design.
- The static question bank remains checked into the repo and server-only imported. It is not moved to Supabase in this plan.

## Deferred By Design

- Admin CRUD for questions.
- Moving `questions.json` to Supabase.
- Payments or subscriptions.
- Multi-user dashboards.
- Public user profile pages.
- Analytics dashboard.
- Owner-only route protection for `/interview`.
- GitHub Marketplace listing.

## Final Verification Checklist

- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes.
- [ ] `/interview` works anonymously.
- [ ] GitHub login works locally.
- [ ] GitHub login works in production after redirect URLs are configured.
- [ ] Signed-in profile card shows GitHub user data.
- [ ] Signed-in profile card no longer uses fixed owner name.
- [ ] Learned progress persists after reload.
- [ ] Bookmarks persist after reload.
- [ ] Pinned categories persist after reload.
- [ ] Anonymous local progress can sync after login.
- [ ] Different GitHub accounts do not see each other's progress.
- [ ] Supabase RLS is enabled on all three tables.
- [ ] No real secret values are committed.

## Plan Self-Review

- Spec coverage: GitHub OAuth, any-account login, GitHub profile card, per-user learned/bookmark progress, pinned categories, local-to-account sync, Supabase storage, manual configuration, and verification are covered.
- Placeholder scan: The plan intentionally uses placeholder strings only for secrets/env values that must not be committed. There are no unspecified implementation sections.
- Type consistency: `CurrentViewer`, `InterviewLearningStateSnapshot`, and provider hook names are introduced before use.
- Scope check: This is one coherent auth/progress feature. Admin CRUD, analytics, payments, and question database migration are explicitly out of scope.
