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
