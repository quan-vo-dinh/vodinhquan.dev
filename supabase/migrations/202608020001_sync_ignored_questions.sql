-- Migration to support sync of ignored interview questions
alter table public.interview_question_progress
  add column if not exists ignored_at timestamptz;

alter table public.interview_question_progress
  drop constraint if exists interview_question_progress_has_state;

alter table public.interview_question_progress
  add constraint interview_question_progress_has_state check (
    learned_at is not null
    or bookmarked_at is not null
    or ignored_at is not null
    or last_reviewed_at is not null
  );

create or replace function public.merge_interview_learning_state(
  p_learned_ids integer[] default '{}',
  p_bookmarked_ids integer[] default '{}',
  p_pinned_categories text[] default '{}',
  p_ignored_ids integer[] default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_time timestamptz := now();
  progress_snapshot jsonb;
  pinned_snapshot text[];
begin
  select auth.uid() into current_user_id;

  if current_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not public.is_interview_owner() then
    raise exception 'Forbidden: Owner account required';
  end if;

  -- Merge learned
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

  -- Merge bookmarked
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

  -- Merge ignored
  insert into public.interview_question_progress (
    user_id,
    question_id,
    ignored_at
  )
  select distinct
    current_user_id,
    question_id,
    current_time
  from unnest(p_ignored_ids) as question_id
  on conflict (user_id, question_id) do update
  set ignored_at = coalesce(
    public.interview_question_progress.ignored_at,
    excluded.ignored_at
  );

  -- Merge pinned categories
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
    ),
    'ignoredIds',
    coalesce(
      jsonb_agg(question_id order by question_id)
        filter (where ignored_at is not null),
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
