-- Keep this username aligned with INTERVIEW_OWNER_GITHUB_USERNAME.
-- Apply this migration before deploying the owner-only application code.
create table if not exists public.interview_owner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  github_username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.interview_owner_accounts enable row level security;

revoke all on table public.interview_owner_accounts from anon, authenticated;

insert into public.interview_owner_accounts (user_id, github_username)
select
  id,
  coalesce(
    raw_user_meta_data->>'user_name',
    raw_user_meta_data->>'preferred_username'
  )
from auth.users
where lower(
  coalesce(
    raw_user_meta_data->>'user_name',
    raw_user_meta_data->>'preferred_username',
    ''
  )
) = 'vodinhquan'
on conflict (user_id) do update
set github_username = excluded.github_username;

create or replace function public.is_interview_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.interview_owner_accounts
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_interview_owner() from public;
grant execute on function public.is_interview_owner() to authenticated;

alter table public.interview_question_progress
  drop constraint if exists interview_question_progress_question_id_positive;

alter table public.interview_question_progress
  add constraint interview_question_progress_question_id_positive
  check (question_id > 0);

alter table public.interview_user_preferences
  drop constraint if exists interview_user_preferences_pinned_categories_limit;

alter table public.interview_user_preferences
  add constraint interview_user_preferences_pinned_categories_limit
  check (cardinality(pinned_categories) <= 100);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  github_username text := coalesce(
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username'
  );
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
    github_username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      github_username
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    case
      when coalesce(github_username, '') <> ''
      then 'https://github.com/' || github_username
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

  if lower(coalesce(github_username, '')) = 'vodinhquan' then
    insert into public.interview_owner_accounts (user_id, github_username)
    values (new.id, github_username)
    on conflict (user_id) do update
    set github_username = excluded.github_username;

    insert into public.interview_user_preferences (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop policy if exists "Users can view their own profile." on public.profiles;
drop policy if exists "Owner can view their profile." on public.profiles;
create policy "Owner can view their profile."
on public.profiles for select
to authenticated
using (
  (select auth.uid()) = id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Owner can update their profile." on public.profiles;
create policy "Owner can update their profile."
on public.profiles for update
to authenticated
using (
  (select auth.uid()) = id
  and (select public.is_interview_owner())
)
with check (
  (select auth.uid()) = id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can view their own interview progress." on public.interview_question_progress;
drop policy if exists "Owner can view interview progress." on public.interview_question_progress;
create policy "Owner can view interview progress."
on public.interview_question_progress for select
to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can insert their own interview progress." on public.interview_question_progress;
drop policy if exists "Owner can insert interview progress." on public.interview_question_progress;
create policy "Owner can insert interview progress."
on public.interview_question_progress for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can update their own interview progress." on public.interview_question_progress;
drop policy if exists "Owner can update interview progress." on public.interview_question_progress;
create policy "Owner can update interview progress."
on public.interview_question_progress for update
to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
)
with check (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can delete their own interview progress." on public.interview_question_progress;
drop policy if exists "Owner can delete interview progress." on public.interview_question_progress;
create policy "Owner can delete interview progress."
on public.interview_question_progress for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can view their own interview preferences." on public.interview_user_preferences;
drop policy if exists "Owner can view interview preferences." on public.interview_user_preferences;
create policy "Owner can view interview preferences."
on public.interview_user_preferences for select
to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can insert their own interview preferences." on public.interview_user_preferences;
drop policy if exists "Owner can insert interview preferences." on public.interview_user_preferences;
create policy "Owner can insert interview preferences."
on public.interview_user_preferences for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

drop policy if exists "Users can update their own interview preferences." on public.interview_user_preferences;
drop policy if exists "Owner can update interview preferences." on public.interview_user_preferences;
create policy "Owner can update interview preferences."
on public.interview_user_preferences for update
to authenticated
using (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
)
with check (
  (select auth.uid()) = user_id
  and (select public.is_interview_owner())
);

create or replace function public.merge_interview_learning_state(
  p_learned_ids integer[],
  p_bookmarked_ids integer[],
  p_pinned_categories text[]
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_time timestamptz := now();
  progress_snapshot jsonb;
  pinned_snapshot text[];
begin
  if current_user_id is null or not public.is_interview_owner() then
    raise exception 'Owner authentication required'
      using errcode = '42501';
  end if;

  if p_learned_ids is null
    or p_bookmarked_ids is null
    or p_pinned_categories is null
    or cardinality(p_learned_ids) > 2500
    or cardinality(p_bookmarked_ids) > 2500
    or cardinality(p_pinned_categories) > 100
  then
    raise exception 'Invalid learning state payload'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(p_learned_ids || p_bookmarked_ids) as question_id
    where question_id <= 0
  ) then
    raise exception 'Question identifiers must be positive'
      using errcode = '23514';
  end if;

  insert into public.interview_question_progress (
    user_id,
    question_id,
    learned_at,
    last_reviewed_at
  )
  select distinct
    current_user_id,
    question_id,
    current_time,
    current_time
  from unnest(p_learned_ids) as question_id
  on conflict (user_id, question_id) do update
  set
    learned_at = coalesce(
      public.interview_question_progress.learned_at,
      excluded.learned_at
    ),
    last_reviewed_at = coalesce(
      public.interview_question_progress.last_reviewed_at,
      excluded.last_reviewed_at
    );

  insert into public.interview_question_progress (
    user_id,
    question_id,
    bookmarked_at
  )
  select distinct
    current_user_id,
    question_id,
    current_time
  from unnest(p_bookmarked_ids) as question_id
  on conflict (user_id, question_id) do update
  set bookmarked_at = coalesce(
    public.interview_question_progress.bookmarked_at,
    excluded.bookmarked_at
  );

  insert into public.interview_user_preferences (
    user_id,
    pinned_categories
  )
  values (
    current_user_id,
    p_pinned_categories
  )
  on conflict (user_id) do update
  set pinned_categories = (
    select coalesce(array_agg(category order by category), '{}'::text[])
    from (
      select distinct category
      from unnest(
        public.interview_user_preferences.pinned_categories
        || excluded.pinned_categories
      ) as category
      where length(trim(category)) > 0
    ) as merged_categories
  );

  select jsonb_build_object(
    'learnedIds',
    coalesce(
      jsonb_agg(question_id order by question_id)
        filter (where learned_at is not null),
      '[]'::jsonb
    ),
    'bookmarkedIds',
    coalesce(
      jsonb_agg(question_id order by question_id)
        filter (where bookmarked_at is not null),
      '[]'::jsonb
    )
  )
  into progress_snapshot
  from public.interview_question_progress
  where user_id = current_user_id;

  select pinned_categories
  into pinned_snapshot
  from public.interview_user_preferences
  where user_id = current_user_id;

  return progress_snapshot || jsonb_build_object(
    'pinnedCategories',
    coalesce(to_jsonb(pinned_snapshot), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.merge_interview_learning_state(
  integer[],
  integer[],
  text[]
) from public;

grant execute on function public.merge_interview_learning_state(
  integer[],
  integer[],
  text[]
) to authenticated;
