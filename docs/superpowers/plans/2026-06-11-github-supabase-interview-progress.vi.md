# Kế hoạch Triển khai Tiến trình Luyện tập Phỏng vấn với GitHub và Supabase

> **Dành cho các AI agent:** KỸ NĂNG PHỤ BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng tác vụ. Các bước sử dụng cú pháp hộp kiểm (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Thêm đăng nhập bằng GitHub cho bất kỳ tài khoản GitHub nào và lưu trữ lâu dài tiến trình Luyện tập Phỏng vấn (Interview Practice) của mỗi người dùng trong Supabase thay vì chỉ dùng localStorage.

**Kiến trúc:** Giữ cho ngân hàng câu hỏi ở phía server-only và tĩnh trong tính năng `interview-practice` hiện có. Thêm Supabase Auth cho các phiên GitHub OAuth, các bảng Supabase Postgres được bảo vệ bởi RLS cho tiến trình/tùy chọn của từng người dùng, và một hybrid learning-state provider (nhà cung cấp trạng thái học tập lai) sử dụng localStorage cho người dùng ẩn danh và Supabase cho người dùng đã đăng nhập. Giao diện (UI) `/interview` vẫn hiển thị công khai và nhỏ gọn, nhưng các phần hiển thị hồ sơ/thứ hạng/tiến trình sẽ nhận biết được người dùng hiện tại.

**Tech Stack (Ngăn xếp công nghệ):** Next.js 16 App Router, React 19, Supabase Auth, `@supabase/ssr`, `@supabase/supabase-js`, Supabase Postgres RLS, các thành phần giao diện shadcn/ui đã có sẵn trong kho lưu trữ này.

---

## Bằng chứng và Trạng thái Hiện tại

- CodeGraph đã được sử dụng trước khi viết kế hoạch này.
  - `codegraph status .` báo cáo 65 tệp được lập chỉ mục, 465 nút, 748 cạnh, đã được cập nhật.
  - `codegraph context "create implementation plan for Supabase GitHub OAuth login and per-user interview progress storage; inspect app router interview feature localStorage profile card navbar package"` đã tìm thấy layout App Router, navbar, các biểu tượng và các thành phần giao diện UI có liên quan.
- Tuyến đường `/interview` hiện tại nằm ở `src/app/interview/page.tsx`.
- Dữ liệu câu hỏi đã nằm sau một repository server-only tại `src/features/interview-practice/lib/question-repository.ts`.
- Tiến trình câu hỏi đã học/được đánh dấu hiện đang nằm trong `window.localStorage` bên trong `src/features/interview-practice/components/local-learning-state.tsx`.
- Các danh mục được ghim hiện đang nằm trong `window.localStorage` bên trong `src/features/interview-practice/components/interview-practice-page.tsx`.
- Thẻ hồ sơ/thứ hạng hiện đang đọc dữ liệu cố định của chủ sở hữu từ `DATA.name`, `DATA.avatarUrl`, và `DATA.contact.social.GitHub.url`.
- Tệp `package.json` hiện không bao gồm các gói Supabase.
- Không có bất kỳ tệp `.env*`, `proxy.ts`, `middleware.ts` nào, hoặc tuyến đường gọi lại xác thực (auth callback route) nào tồn tại trong kho lưu trữ.

## Tài liệu Context7 Được Sử dụng

Các lệnh đã sử dụng để lấy tài liệu hiện tại:

```bash
npx ctx7@latest library Supabase "Next.js App Router Supabase Auth GitHub OAuth callback exchangeCodeForSession SSR RLS user progress plan"
npx ctx7@latest docs /supabase/ssr "Next.js App Router Supabase SSR GitHub OAuth signInWithOAuth auth callback exchangeCodeForSession proxy middleware cookies getUser"
npx ctx7@latest docs /supabase/supabase "Supabase Auth GitHub provider OAuth redirect URLs Postgres row level security auth.uid user owned progress table policies"
```

Các điểm rút ra quan trọng:

- Sử dụng `@supabase/ssr` `createServerClient` cho mỗi yêu cầu và truyền các cookie `getAll`/`setAll`.
- Gọi `supabase.auth.getUser()` để kiểm tra danh tính người dùng đã được xác minh.
- Hoàn tất OAuth bằng cách trao đổi `code` trong `/auth/callback` bằng `exchangeCodeForSession`.
- Bảo vệ các dòng thuộc sở hữu của người dùng bằng các chính sách RLS so sánh `auth.uid()` với ID của chủ sở hữu dòng.

## Đánh giá Thiết lập GitHub/Supabase Hiện tại của Bạn

Những phần có vẻ đã chính xác từ các chi tiết bạn đã chia sẻ:

- GitHub OAuth App đã tồn tại: `Quan Portfolio Studio`.
- URL gọi lại GitHub OAuth trỏ đến URL gọi lại của Supabase Auth:
  - `https://mqbeijnhwctgrxkqkgvh.supabase.co/auth/v1/callback`
- Supabase GitHub provider đã được bật.
- Supabase GitHub provider đã cấu hình cùng một GitHub Client ID.
- URL dự án Supabase đã xác định:
  - `https://mqbeijnhwctgrxkqkgvh.supabase.co`
- Supabase publishable key đã tồn tại.
- Supabase Data API có vẻ đã khả dụng cho dự án.

Cấu hình thủ công vẫn được yêu cầu hoặc phải được xác minh bởi bạn:

- Không cam kết (commit) GitHub Client Secret, Supabase secret key, hoặc bất kỳ thông tin nhạy cảm (secret) thực tế nào vào kho lưu trữ này.
- Tự thêm các biến môi trường cục bộ vào tệp `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mqbeijnhwctgrxkqkgvh.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<copy Supabase publishable key from dashboard>"
```

- Không thêm `SUPABASE_SECRET_KEY` cho tính năng này. Mã phía client/server nên sử dụng publishable key kết hợp với RLS.
- Trong Bảng điều khiển Supabase, hãy xác minh cấu hình Auth URL:
  - Site URL cho môi trường phát triển cục bộ (local): `http://localhost:3000`
  - Thêm các URL chuyển hướng (Redirect URLs):

```txt
http://localhost:3000/auth/callback
https://vodinhquan.dev/auth/callback
```

- Nếu môi trường production sử dụng một URL được triển khai khác trước, hãy thêm chính xác URL đó:

```txt
https://<your-deployment-domain>/auth/callback
```

- Nếu sử dụng triển khai xem trước (preview deployments) của Vercel, hãy thêm mẫu chuyển hướng xem trước được Supabase hỗ trợ cho cấu hình dự án của bạn.
- URL trang chủ GitHub OAuth App có thể để là `http://localhost:3000` cho việc kiểm tra cục bộ, nhưng nên đổi thành trang chủ production trước khi khởi chạy công khai:

```txt
https://vodinhquan.dev
```

- Chạy bản di chuyển (migration) SQL schema/RLS trong Supabase SQL Editor, hoặc liên kết với Supabase CLI trước khi áp dụng nó.
- Nếu bất kỳ giá trị secret nào đã dán bị chia sẻ công khai ở đâu đó, hãy thu hồi và cấp lại (rotate) GitHub Client Secret và Supabase secret key. Kế hoạch triển khai này không cần khóa secret key.

## Kế hoạch Cấu trúc Tệp

Tạo mới:

- `src/lib/supabase/browser.ts` - Supabase client chạy trên Browser cho các client component.
- `src/lib/supabase/server.ts` - Supabase client chạy trên Server cho các server component, route handler, và server action.
- `src/lib/supabase/proxy.ts` - Logic làm mới cookie/phiên chung cho `proxy.ts`.
- `src/lib/supabase/types.ts` - Định nghĩa kiểu dữ liệu tối giản cho các bảng Supabase được tính năng này sử dụng.
- `proxy.ts` - Next.js request proxy giúp làm mới cookie xác thực của Supabase.
- `src/app/auth/callback/route.ts` - Tuyến đường gọi lại OAuth giúp trao đổi mã code lấy phiên làm việc (session).
- `src/app/auth/sign-in/github/route.ts` - Tuyến đường bắt đầu luồng GitHub OAuth.
- `src/app/auth/sign-out/route.ts` - Tuyến đường đăng xuất.
- `src/app/auth/auth-code-error/page.tsx` - Màn hình lỗi xác thực nhỏ.
- `supabase/migrations/202606110001_interview_progress.sql` - Lược đồ SQL và các chính sách RLS.
- `src/features/auth/types.ts` - Kiểu người xem (viewer) hướng tới ứng dụng.
- `src/features/auth/lib/get-current-viewer.ts` - Hàm bổ trợ phía server để đọc thông tin người xem hiện tại được liên kết với GitHub.
- `src/features/auth/components/sign-in-with-github-button.tsx` - Nút đăng nhập GitHub có thể tái sử dụng.
- `src/features/auth/components/sign-out-button.tsx` - Nút đăng xuất có thể tái sử dụng.
- `src/features/interview-practice/lib/learning-state-types.ts` - Các DTO trạng thái học tập dùng chung.
- `src/features/interview-practice/lib/learning-state-repository.ts` - Các truy vấn đọc Supabase chỉ chạy ở server cho tiến trình/tùy chọn.
- `src/features/interview-practice/actions/learning-state-actions.ts` - Các Server Action để bật tắt/đồng bộ/tùy chọn.
- `src/features/interview-practice/components/interview-learning-state-provider.tsx` - Provider phía client làm cầu nối giữa trạng thái cục bộ ẩn danh và trạng thái Supabase đã xác thực.
- `src/features/interview-practice/components/interview-profile-card.tsx` - Thẻ hồ sơ/thứ hạng nhận biết người dùng hiện tại.
- `src/features/interview-practice/components/learning-sync-banner.tsx` - Biểu ngữ nhắc đồng bộ dữ liệu cục bộ vào tài khoản sau khi đăng nhập.

Chỉnh sửa:

- `package.json` và `pnpm-lock.yaml` - Thêm các phụ thuộc Supabase.
- `.env.example` - Tài liệu hóa các biến môi trường công khai bắt buộc mà không chứa các khóa bí mật (secret) thực tế.
- `src/app/interview/page.tsx` - Tải thông tin người xem và trạng thái học tập ban đầu ở phía server.
- `src/features/interview-practice/components/interview-practice-page.tsx` - Bao bọc nội dung trong provider, truyền viewer, loại bỏ việc hardcode hồ sơ trực tiếp, chuyển danh mục được ghim từ localStorage vào provider.
- `src/features/interview-practice/components/question-list.tsx` - Sử dụng hook learning-state mới và thay đổi từ ngữ đồng bộ.
- `src/features/interview-practice/components/flashcard-deck.tsx` - Sử dụng hook learning-state mới.
- `src/features/interview-practice/components/progress-summary.tsx` - Sử dụng hook learning-state mới và nội dung thông báo phù hợp với chế độ hoạt động.
- `src/features/interview-practice/components/category-progress-vertical.tsx` - Sử dụng hook learning-state mới.
- `src/features/interview-practice/components/local-learning-state.tsx` - Giữ lại như một helper lưu trữ ẩn danh hoặc thay thế bằng một module lưu trữ cục bộ có phạm vi hẹp hơn.

## Mô hình Dữ liệu

Sử dụng Supabase Auth làm nguồn xác thực danh tính. `auth.users.id` là ID người dùng chuẩn.

Các bảng tiến trình nên tham chiếu đến các giá trị `question_id` tĩnh từ tệp `questions.json`. Không chuyển ngân hàng câu hỏi vào Supabase cho tính năng này.

### SQL Migration (Di chuyển Cơ sở Dữ liệu)

Tạo tệp `supabase/migrations/202606110001_interview_progress.sql` với nội dung:

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

Truy vấn xác minh thủ công sau khi áp dụng SQL:

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

Các dòng kết quả mong đợi:

```txt
interview_question_progress
interview_user_preferences
profiles
```

## Các Tác vụ Triển khai

### Tác vụ 1: Thêm các Phụ thuộc Supabase và Bản mẫu Biến Môi trường

**Các tệp:**

- Chỉnh sửa: `package.json`
- Chỉnh sửa: `pnpm-lock.yaml`
- Tạo mới: `.env.example`

- [ ] **Bước 1: Cài đặt các gói Supabase**

Chạy:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

Kết quả mong đợi:

```txt
dependencies:
+ @supabase/supabase-js
+ @supabase/ssr
```

- [ ] **Bước 2: Tạo tệp `.env.example`**

Tạo:

```bash
touch .env.example
```

Nội dung:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mqbeijnhwctgrxkqkgvh.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<copy-from-supabase-dashboard>"
```

- [ ] **Bước 3: Người dùng tự thiết lập thủ công các biến môi trường**

Người dùng phải tạo tệp `.env.local` với các giá trị thực tế:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mqbeijnhwctgrxkqkgvh.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<real-publishable-key>"
```

Không ghi GitHub Client Secret hoặc Supabase secret key vào tệp `.env.local` cho tính năng này.

- [ ] **Bước 4: Xác minh cài đặt các gói**

Chạy:

```bash
pnpm lint
```

Kết quả mong đợi: lệnh lint chạy thành công mà không gặp lỗi phân giải phụ thuộc.

- [ ] **Bước 5: Cam kết mã nguồn**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "chore: add supabase auth dependencies"
```

### Tác vụ 2: Thêm Lược đồ SQL và RLS của Supabase

**Các tệp:**

- Tạo mới: `supabase/migrations/202606110001_interview_progress.sql`

- [ ] **Bước 1: Tạo tệp di chuyển**

Chạy:

```bash
mkdir -p supabase/migrations
touch supabase/migrations/202606110001_interview_progress.sql
```

- [ ] **Bước 2: Dán nội dung SQL di chuyển**

Dán nội dung SQL từ mục `Mô hình Dữ liệu` vào tệp:

```txt
supabase/migrations/202606110001_interview_progress.sql
```

- [ ] **Bước 3: Áp dụng cơ sở dữ liệu thủ công**

Chọn một trong hai cách:

```txt
Cách A: Bảng điều khiển Supabase (Supabase Dashboard)
1. Mở SQL Editor trong Supabase.
2. Dán mã SQL di chuyển.
3. Chạy nó trên dự án mqbeijnhwctgrxkqkgvh.

Cách B: Supabase CLI
1. Liên kết (link) kho lưu trữ này với dự án Supabase.
2. Áp dụng bản di chuyển.
```

Mặc định cho kho lưu trữ này nên là Cách A trừ khi Supabase CLI đã được liên kết từ trước.

- [ ] **Bước 4: Xác minh lược đồ**

Chạy trong Supabase SQL Editor:

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

Kết quả mong đợi: ba hàng kết quả được liệt kê theo thứ tự bảng chữ cái.

- [ ] **Bước 5: Cam kết mã nguồn**

```bash
git add supabase/migrations/202606110001_interview_progress.sql
git commit -m "feat: add interview progress schema"
```

### Tác vụ 3: Thêm các Hàm Bổ trợ Supabase Client và Proxy

**Các tệp:**

- Tạo mới: `src/lib/supabase/types.ts`
- Tạo mới: `src/lib/supabase/browser.ts`
- Tạo mới: `src/lib/supabase/server.ts`
- Tạo mới: `src/lib/supabase/proxy.ts`
- Tạo mới: `proxy.ts`

- [ ] **Bước 1: Tạo các kiểu dữ liệu cơ sở dữ liệu tối giản**

Tạo tệp `src/lib/supabase/types.ts`:

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

- [ ] **Bước 2: Tạo browser client**

Tạo tệp `src/lib/supabase/browser.ts`:

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

- [ ] **Bước 3: Tạo server client**

Tạo tệp `src/lib/supabase/server.ts`:

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
            // Server Components không phải lúc nào cũng ghi được cookie.
            // Request proxy sẽ xử lý việc duy trì làm mới phiên.
          }
        },
      },
    }
  );
}
```

- [ ] **Bước 4: Tạo hàm bổ trợ proxy**

Tạo tệp `src/lib/supabase/proxy.ts`:

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

- [ ] **Bước 5: Tạo proxy gốc**

Tạo tệp `proxy.ts`:

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

- [ ] **Bước 6: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai lệnh đều vượt qua thành công mà không gặp lỗi thiếu biến môi trường khi tệp `.env.local` tồn tại.

- [ ] **Bước 7: Cam kết mã nguồn**

```bash
git add src/lib/supabase proxy.ts
git commit -m "feat: add supabase ssr clients"
```

### Tác vụ 4: Thêm các Tuyến đường Xác thực (Auth Routes)

**Các tệp:**

- Tạo mới: `src/app/auth/callback/route.ts`
- Tạo mới: `src/app/auth/sign-in/github/route.ts`
- Tạo mới: `src/app/auth/sign-out/route.ts`
- Tạo mới: `src/app/auth/auth-code-error/page.tsx`

- [ ] **Bước 1: Thêm tuyến đường đăng nhập GitHub**

Tạo tệp `src/app/auth/sign-in/github/route.ts`:

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

- [ ] **Bước 2: Thêm tuyến đường gọi lại (callback route)**

Tạo tệp `src/app/auth/callback/route.ts`:

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

- [ ] **Bước 3: Thêm tuyến đường đăng xuất**

Tạo tệp `src/app/auth/sign-out/route.ts`:

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

- [ ] **Bước 4: Thêm trang lỗi xác thực**

Tạo tệp `src/app/auth/auth-code-error/page.tsx`:

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

- [ ] **Bước 5: Người dùng xác minh thủ công cấu hình OAuth**

Trước khi kiểm tra tuyến đường này, hãy xác minh các URL chuyển hướng của Supabase Auth bao gồm:

```txt
http://localhost:3000/auth/callback
https://vodinhquan.dev/auth/callback
```

- [ ] **Bước 6: Xác minh quá trình build các tuyến đường**

Run:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 7: Cam kết mã nguồn**

```bash
git add src/app/auth
git commit -m "feat: add github auth routes"
```

### Tác vụ 5: Thêm các Hàm Bổ trợ Viewer và các Nút Xác thực

**Các tệp:**

- Tạo mới: `src/features/auth/types.ts`
- Tạo mới: `src/features/auth/lib/get-current-viewer.ts`
- Tạo mới: `src/features/auth/components/sign-in-with-github-button.tsx`
- Tạo mới: `src/features/auth/components/sign-out-button.tsx`

- [ ] **Bước 1: Thêm kiểu dữ liệu viewer**

Tạo tệp `src/features/auth/types.ts`:

```ts
export type CurrentViewer = {
  id: string;
  githubUsername: string | null;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string | null;
};
```

- [ ] **Bước 2: Thêm hàm bổ trợ viewer phía server**

Tạo tệp `src/features/auth/lib/get-current-viewer.ts`:

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

- [ ] **Bước 3: Thêm nút đăng nhập**

Tạo tệp `src/features/auth/components/sign-in-with-github-button.tsx`:

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

- [ ] **Bước 4: Thêm nút đăng xuất**

Tạo tệp `src/features/auth/components/sign-out-button.tsx`:

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

- [ ] **Bước 5: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 6: Cam kết mã nguồn**

```bash
git add src/features/auth
git commit -m "feat: add github viewer helpers"
```

### Tác vụ 6: Thêm Kho lưu trữ Trạng thái Học tập phía Server (Learning State Repository)

**Các tệp:**

- Tạo mới: `src/features/interview-practice/lib/learning-state-types.ts`
- Tạo mới: `src/features/interview-practice/lib/learning-state-repository.ts`

- [ ] **Bước 1: Thêm các kiểu dữ liệu trạng thái học tập**

Tạo tệp `src/features/interview-practice/lib/learning-state-types.ts`:

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

- [ ] **Bước 2: Thêm kho lưu trữ**

Tạo tệp `src/features/interview-practice/lib/learning-state-repository.ts`:

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

- [ ] **Bước 3: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 4: Cam kết mã nguồn**

```bash
git add src/features/interview-practice/lib/learning-state-types.ts src/features/interview-practice/lib/learning-state-repository.ts
git commit -m "feat: read interview learning state"
```

### Tác vụ 7: Thêm các Server Action cho Trạng thái Học tập

**Các tệp:**

- Tạo mới: `src/features/interview-practice/actions/learning-state-actions.ts`

- [ ] **Bước 1: Thêm các Server Action**

Tạo tệp `src/features/interview-practice/actions/learning-state-actions.ts`:

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

- [ ] **Bước 2: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 3: Cam kết mã nguồn**

```bash
git add src/features/interview-practice/actions/learning-state-actions.ts
git commit -m "feat: add interview learning actions"
```

### Tác vụ 8: Thay thế Hook Chỉ dùng Cục bộ bằng Hybrid Provider (Nhà cung cấp Lai)

**Các tệp:**

- Tạo mới: `src/features/interview-practice/components/interview-learning-state-provider.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/local-learning-state.tsx`

- [ ] **Bước 1: Giữ các hàm bổ trợ lưu trữ cục bộ ở trạng thái khả dụng**

Chỉnh sửa `src/features/interview-practice/components/local-learning-state.tsx` để xuất (export) các khóa lưu trữ và các hàm bổ trợ thuần túy bên cạnh hook hiện tại:

```ts
export const LEARNED_STORAGE_KEY = "interview-practice:v1:learned";
export const BOOKMARK_STORAGE_KEY = "interview-practice:v1:bookmarks";
export const PINNED_CATEGORIES_STORAGE_KEY =
  "interview-practice:v1:pinned-categories";
```

Thêm các hàm bổ trợ:

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

- [ ] **Bước 2: Thêm hybrid provider**

Tạo tệp `src/features/interview-practice/components/interview-learning-state-provider.tsx`:

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

- [ ] **Bước 3: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: quá trình build có thể thất bại cho đến khi các component tiêu thụ được chuyển đổi trong tác vụ tiếp theo nếu lint giới hạn các phần export không sử dụng. Nếu nó chỉ thất bại do mã không sử dụng, hãy tiếp tục thực hiện Tác vụ 9 trước khi xác minh cuối cùng.

- [ ] **Bước 4: Cam kết mã nguồn**

```bash
git add src/features/interview-practice/components/local-learning-state.tsx src/features/interview-practice/components/interview-learning-state-provider.tsx
git commit -m "feat: add hybrid interview learning provider"
```

### Tác vụ 9: Kết nối Trạng thái Server vào Trang Phỏng vấn

**Các tệp:**

- Chỉnh sửa: `src/app/interview/page.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Bước 1: Tải thông tin viewer và trạng thái học tập trong tuyến đường (route)**

Chỉnh sửa các phần import của `src/app/interview/page.tsx`:

```ts
import { getCurrentViewer } from "@/features/auth/lib/get-current-viewer";
import { getCurrentUserInterviewLearningState } from "@/features/interview-practice/lib/learning-state-repository";
```

Bên trong `InterviewPage`, thêm:

```ts
const [viewer, learningState] = await Promise.all([
  getCurrentViewer(),
  getCurrentUserInterviewLearningState(),
]);
```

Truyền các prop:

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

- [ ] **Bước 2: Cập nhật các prop của trang**

Trong `src/features/interview-practice/components/interview-practice-page.tsx`, import:

```ts
import type { CurrentViewer } from "@/features/auth/types";
import type { InterviewLearningStateSnapshot } from "../lib/learning-state-types";
import {
  InterviewLearningStateProvider,
  useInterviewLearningState,
} from "./interview-learning-state-provider";
```

Cập nhật `InterviewPracticePageProps`:

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

Bao bọc UI được trả về:

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

Di chuyển phần thân của component hiện tại vào một component nội bộ mới tên là `InterviewPracticePageContent` với cùng các prop ngoại trừ `initialLearningState`.

- [ ] **Bước 3: Thay thế việc sử dụng hook cục bộ trên trang**

Thay thế:

```ts
const { isReady, learnedIds } = useLocalLearningState();
```

Bằng:

```ts
const {
  isReady,
  learnedIds,
  pinnedCategories,
  togglePinCategory,
} = useInterviewLearningState();
```

Loại bỏ `pinnedCategories` `useState` cục bộ, hiệu ứng hydration localStorage cho danh mục được ghim, và hàm gọi lại `togglePinCategory` cũ.

- [ ] **Bước 4: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua sau khi tất cả các phần import được sửa lại chính xác.

- [ ] **Bước 5: Cam kết mã nguồn**

```bash
git add src/app/interview/page.tsx src/features/interview-practice/components/interview-practice-page.tsx
git commit -m "feat: load interview learning state from server"
```

### Tác vụ 10: Thay thế ở Các Component Tiêu thụ Hook

**Các tệp:**

- Chỉnh sửa: `src/features/interview-practice/components/question-list.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/flashcard-deck.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/progress-summary.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/category-progress-vertical.tsx`

- [ ] **Bước 1: Thay thế các phần import**

Trong mỗi tệp, thay thế:

```ts
import { useLocalLearningState } from "./local-learning-state";
```

Bằng:

```ts
import { useInterviewLearningState } from "./interview-learning-state-provider";
```

- [ ] **Bước 2: Thay thế các lệnh gọi hook**

Thay thế:

```ts
useLocalLearningState()
```

Bằng:

```ts
useInterviewLearningState()
```

- [ ] **Bước 3: Cập nhật các nội dung văn bản hiển thị cho người dùng**

Trong `question-list.tsx`, thay thế nội dung tooltip:

```tsx
<TooltipContent>Track your local progress</TooltipContent>
```

Bằng:

```tsx
<TooltipContent>Track your progress</TooltipContent>
```

Thay thế:

```tsx
<TooltipContent>Save this question locally</TooltipContent>
```

Bằng:

```tsx
<TooltipContent>Save this question</TooltipContent>
```

Trong `progress-summary.tsx`, đọc `isAuthenticated` từ hook:

```ts
const { bookmarkedIds, isAuthenticated, isReady, learnedIds } =
  useInterviewLearningState();
```

Thay thế:

```tsx
<p className="text-sm font-medium">Local progress</p>
```

Bằng:

```tsx
<p className="text-sm font-medium">
  {isAuthenticated ? "Synced progress" : "Local progress"}
</p>
```

Thay thế:

```tsx
Stored only in this browser for now.
```

Bằng:

```tsx
{isAuthenticated
  ? "Saved to your GitHub-backed account."
  : "Stored only in this browser until you sign in."}
```

- [ ] **Bước 4: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 5: Cam kết mã nguồn**

```bash
git add src/features/interview-practice/components/question-list.tsx src/features/interview-practice/components/flashcard-deck.tsx src/features/interview-practice/components/progress-summary.tsx src/features/interview-practice/components/category-progress-vertical.tsx
git commit -m "feat: use synced interview learning state"
```

### Tác vụ 11: Tách Thẻ Hồ sơ Phỏng vấn Nhận biết Người dùng (User-Aware Interview Profile Card)

**Các tệp:**

- Tạo mới: `src/features/interview-practice/components/interview-profile-card.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Bước 1: Tạo component thẻ hồ sơ**

Di chuyển mã JSX của thẻ hồ sơ hiện có từ `interview-practice-page.tsx` sang `interview-profile-card.tsx`.

Khai báo kiểu của component:

```ts
type InterviewProfileCardProps = {
  categoryProgress: number;
  learnedCount: number;
  viewer: CurrentViewer | null;
};
```

Quy tắc hiển thị:

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

Liên kết GitHub khi đã đăng nhập:

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

Đăng xuất khi đã đăng nhập:

```tsx
{viewer ? <SignOutButton /> : null}
```

- [ ] **Bước 2: Thay thế thẻ inline trong trang phỏng vấn**

Trong `interview-practice-page.tsx`, thay thế khối hồ sơ `CardContainer` inline bằng:

```tsx
<InterviewProfileCard
  categoryProgress={categoryProgress}
  learnedCount={categoryLearnedCount}
  viewer={viewer}
/>
```

- [ ] **Bước 3: Đảm bảo tên chủ sở hữu cố định không xuất hiện trong trạng thái đã đăng nhập**

Tìm kiếm:

```bash
rg -n "DATA\\.name|DATA\\.avatarUrl|Vo Dinh Quan|GitHub Profile" src/features/interview-practice
```

Kết quả mong đợi:

- `DATA.name` và `DATA.avatarUrl` không nên được sử dụng bởi thẻ hồ sơ phỏng vấn.
- Trang sơ yếu lý lịch/trang chủ công khai vẫn có thể sử dụng dữ liệu của chủ sở hữu.

- [ ] **Bước 4: Xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 5: Cam kết mã nguồn**

```bash
git add src/features/interview-practice/components/interview-profile-card.tsx src/features/interview-practice/components/interview-practice-page.tsx
git commit -m "feat: show github viewer in interview profile"
```

### Tác vụ 12: Thêm Biểu ngữ Đồng bộ Tiến trình Cục bộ (Local Progress Sync Banner)

**Các tệp:**

- Tạo mới: `src/features/interview-practice/components/learning-sync-banner.tsx`
- Chỉnh sửa: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Bước 1: Tạo biểu ngữ**

Tạo tệp `src/features/interview-practice/components/learning-sync-banner.tsx`:

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

- [ ] **Bước 2: Hiển thị biểu ngữ**

Trong `interview-practice-page.tsx`, hiển thị biểu ngữ phía trên `ProgressSummary`:

```tsx
<LearningSyncBanner />
```

- [ ] **Bước 3: Xác minh**

Kiểm tra thủ công:

1. Đăng xuất.
2. Đánh dấu một câu hỏi đã học.
3. Đánh dấu một câu hỏi.
4. Đăng nhập với GitHub.
5. Xác nhận biểu ngữ xuất hiện.
6. Click sync (đồng bộ).
7. Tải lại trang.
8. Xác nhận tiến trình vẫn được giữ và biểu ngữ biến mất.

- [ ] **Bước 4: Chạy xác minh**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 5: Cam kết mã nguồn**

```bash
git add src/features/interview-practice/components/learning-sync-banner.tsx src/features/interview-practice/components/interview-practice-page.tsx
git commit -m "feat: sync browser interview progress"
```

### Tác vụ 13: Kiểm thử Thủ công Từ đầu đến cuối (End-To-End Manual QA)

**Các tệp:**

- Không cần tệp mã nguồn nào trừ khi QA phát hiện lỗi.

- [ ] **Bước 1: Khởi động máy chủ phát triển (dev server)**

Chạy:

```bash
pnpm dev
```

Kết quả mong đợi:

```txt
Ready
Local: http://localhost:3000
```

- [ ] **Bước 2: Luồng người dùng ẩn danh (Anonymous flow)**

Mở:

```txt
http://localhost:3000/interview
```

Xác minh:

- Trang tải thành công.
- Thẻ hồ sơ hiển thị `Guest learner`.
- Xuất hiện nút `Sign in with GitHub`.
- Đánh dấu đã học hoạt động tốt.
- Đánh dấu lưu hoạt động tốt.
- Ghim danh mục hoạt động tốt.
- Tải lại trang vẫn giữ nguyên tiến trình cục bộ ẩn danh.

- [ ] **Bước 3: Luồng đăng nhập GitHub**

Click:

```txt
Sign in with GitHub
```

Xác minh:

- Màn hình đồng ý GitHub OAuth xuất hiện nếu cần.
- Quá trình callback của Supabase hoàn tất.
- Trình duyệt quay trở lại `/interview`.
- Thẻ hồ sơ hiển thị tên hiển thị, ảnh đại diện, và liên kết GitHub của người dùng đã đăng nhập.
- Nó không hiển thị tên chủ sở hữu cố định đối với người dùng đã đăng nhập.

- [ ] **Bước 4: Luồng tiến trình đã đồng bộ**

Xác minh:

- Đánh dấu đã học ghi dữ liệu vào Supabase.
- Đánh dấu lưu ghi dữ liệu vào Supabase.
- Ghim danh mục ghi dữ liệu vào Supabase.
- Tải lại trang vẫn giữ nguyên tiến trình.
- Đăng nhập từ một trình duyệt khác bằng cùng một tài khoản GitHub sẽ hiển thị cùng một tiến trình học tập.

- [ ] **Bước 5: Luồng cô lập người dùng (User isolation flow)**

Sử dụng một tài khoản GitHub thứ hai nếu có sẵn.

Xác minh:

- Tài khoản thứ hai không nhìn thấy các câu hỏi đã học/được đánh dấu của tài khoản thứ nhất.
- Các hàng trong bảng Supabase có các giá trị `user_id` khác nhau.
- RLS ngăn chặn việc đọc chéo dữ liệu giữa các người dùng khi truy vấn thông qua phiên làm việc của ứng dụng.

- [ ] **Bước 6: Luồng đăng xuất**

Xác minh:

- Đăng xuất sẽ quay trở lại `/interview`.
- Thẻ hồ sơ quay trở về hiển thị `Guest learner`.
- Tiến trình Supabase đã xác thực không còn được hiển thị dưới dạng trạng thái hoạt động hiện tại.

- [ ] **Bước 7: Kiểm tra cấu hình môi trường production**

Trước khi triển khai production, hãy xác minh các biến môi trường của máy chủ hosting:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Xác minh các URL chuyển hướng của Supabase Auth bao gồm production:

```txt
https://vodinhquan.dev/auth/callback
```

- [ ] **Bước 8: Build sản phẩm cuối cùng**

Chạy:

```bash
pnpm lint
pnpm build
```

Kết quả mong đợi: cả hai đều vượt qua thành công.

- [ ] **Bước 9: Cam kết các sửa lỗi QA (nếu có)**

Nếu không cần sửa lỗi nào, hãy bỏ qua bước commit này. Nếu có sửa lỗi:

```bash
git add <changed-files>
git commit -m "fix: polish github interview auth flow"
```

## Các Lưu ý về Bảo mật

- Sử dụng Supabase publishable key kết hợp với RLS cho tính năng này.
- Không sử dụng Supabase secret key trong các client component, route handler, hoặc server action cho tiến trình thông thường của người dùng.
- Không lưu trữ mã thông báo truy cập (access token) GitHub trong các bảng của ứng dụng.
- Không đưa GitHub Client Secret vào hệ thống quản lý phiên bản (source control).
- Các chính sách RLS là bắt buộc trước khi bất kỳ người dùng thực tế nào đăng nhập.
- Bảng `profiles` là riêng tư đối với dòng thuộc sở hữu của chính người dùng đó trong kế hoạch này. Nếu muốn cấu hình hồ sơ công khai (public profiles), hãy triển khai việc đó một cách rõ ràng trong một thiết kế riêng biệt.
- Ngân hàng câu hỏi tĩnh vẫn được lưu trữ trong kho lưu trữ và được import theo dạng server-only. Nó không được chuyển lên Supabase trong kế hoạch này.

## Các Phần được Chủ động Trì hoãn

- Giao diện Admin CRUD cho các câu hỏi.
- Di chuyển `questions.json` lên Supabase.
- Thanh toán hoặc đăng ký thành viên (subscriptions).
- Bảng điều khiển nhiều người dùng (multi-user dashboards).
- Các trang hồ sơ người dùng công khai.
- Bảng phân tích số liệu (analytics dashboard).
- Bảo vệ tuyến đường chỉ dành cho chủ sở hữu đối với `/interview`.
- Đăng tải lên danh sách ứng dụng của GitHub Marketplace.

## Danh sách Xác minh Cuối cùng

- [ ] Lệnh `pnpm lint` vượt qua thành công.
- [ ] Lệnh `pnpm build` vượt qua thành công.
- [ ] Trang `/interview` hoạt động bình thường ở chế độ ẩn danh.
- [ ] Đăng nhập GitHub hoạt động bình thường trên môi trường cục bộ (local).
- [ ] Đăng nhập GitHub hoạt động bình thường trên môi trường production sau khi các URL chuyển hướng được cấu hình.
- [ ] Thẻ hồ sơ sau khi đăng nhập hiển thị dữ liệu của người dùng GitHub.
- [ ] Thẻ hồ sơ sau khi đăng nhập không còn sử dụng tên chủ sở hữu cố định.
- [ ] Tiến trình đã học vẫn được duy trì sau khi tải lại trang.
- [ ] Các đánh dấu lưu vẫn được duy trì sau khi tải lại trang.
- [ ] Các danh mục được ghim vẫn được duy trì sau khi tải lại trang.
- [ ] Tiến trình cục bộ ẩn danh có thể đồng bộ sau khi đăng nhập.
- [ ] Các tài khoản GitHub khác nhau không nhìn thấy tiến trình của nhau.
- [ ] Supabase RLS đã được bật trên cả ba bảng cơ sở dữ liệu.
- [ ] Không có giá trị secret thực tế nào bị commit vào kho lưu trữ.

## Tự Đánh giá Kế hoạch

- Phạm vi bao phủ đặc tả: Đã bao gồm các phần GitHub OAuth, đăng nhập bằng mọi tài khoản, thẻ hồ sơ GitHub, tiến trình câu hỏi đã học/đánh dấu cho mỗi người dùng, các danh mục được ghim, đồng bộ từ cục bộ vào tài khoản, lưu trữ Supabase, cấu hình thủ công và xác minh.
- Quét các chuỗi giữ chỗ (placeholder): Kế hoạch này chỉ sử dụng các chuỗi giữ chỗ một cách có chủ ý cho các khóa bí mật/giá trị môi trường không được commit. Không có phần triển khai nào chưa được xác định rõ ràng.
- Tính nhất quán của kiểu dữ liệu: Các kiểu dữ liệu `CurrentViewer`, `InterviewLearningStateSnapshot` và tên của provider hook đã được giới thiệu trước khi sử dụng.
- Kiểm tra phạm vi (scope): Đây là một tính năng đồng bộ và hoàn chỉnh về xác thực/tiến trình học tập. Các phần Admin CRUD, phân tích, thanh toán và di chuyển cơ sở dữ liệu câu hỏi được xác định rõ là nằm ngoài phạm vi triển khai.
