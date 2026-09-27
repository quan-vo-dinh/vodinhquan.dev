-- Queue Cloudinary cleanup before removing Moment media metadata so provider
-- failures can be retried without retaining an orphaned public asset.
create table if not exists public.media_cleanup_jobs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'cloudinary',
  action text not null default 'destroy',
  public_id text not null,
  resource_type text not null default 'image',
  status text not null default 'queued',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  locked_at timestamptz,
  last_error text,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_cleanup_jobs_provider_check check (provider = 'cloudinary'),
  constraint media_cleanup_jobs_action_check check (action = 'destroy'),
  constraint media_cleanup_jobs_resource_type_check check (
    resource_type in ('image', 'raw', 'video')
  ),
  constraint media_cleanup_jobs_status_check check (
    status in ('queued', 'processing', 'completed', 'failed')
  ),
  constraint media_cleanup_jobs_attempt_count_check check (attempt_count >= 0),
  unique (provider, action, public_id, resource_type)
);

create index if not exists media_cleanup_jobs_pending_idx
  on public.media_cleanup_jobs (next_attempt_at asc, created_at asc)
  where status = 'queued';

drop trigger if exists set_media_cleanup_jobs_updated_at on public.media_cleanup_jobs;
create trigger set_media_cleanup_jobs_updated_at
before update on public.media_cleanup_jobs
for each row execute function public.set_updated_at();

alter table public.media_cleanup_jobs enable row level security;

create or replace function public.delete_moment_asset_and_enqueue_cleanup(
  p_moment_id uuid,
  p_asset_id uuid
)
returns table(slug text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_asset public.moment_media_assets%rowtype;
  v_slug text;
  v_resource_type text;
begin
  if not public.is_site_owner() then
    raise exception 'Owner authentication required.' using errcode = '42501';
  end if;

  select assets
  into v_asset
  from public.moment_media_assets as assets
  where assets.id = p_asset_id
    and assets.moment_id = p_moment_id
  for update;

  if not found then
    raise exception 'Moment asset not found.' using errcode = 'P0002';
  end if;

  select moments.slug
  into v_slug
  from public.moments as moments
  where moments.id = p_moment_id;

  v_resource_type := case
    when v_asset.resource_type in ('raw', 'video') then v_asset.resource_type
    else 'image'
  end;

  insert into public.media_cleanup_jobs (
    action,
    created_by,
    next_attempt_at,
    provider,
    public_id,
    resource_type
  )
  values (
    'destroy',
    v_asset.created_by,
    now(),
    'cloudinary',
    v_asset.cloudinary_public_id,
    v_resource_type
  )
  on conflict (provider, action, public_id, resource_type) do nothing;

  update public.moments
  set cover_asset_id = null
  where id = p_moment_id
    and cover_asset_id = p_asset_id;

  delete from public.moment_media_assets
  where id = p_asset_id;

  return query select v_slug;
end;
$$;

create or replace function public.delete_moment_and_enqueue_cleanup(
  p_moment_id uuid
)
returns table(slug text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_asset public.moment_media_assets%rowtype;
  v_slug text;
  v_resource_type text;
begin
  if not public.is_site_owner() then
    raise exception 'Owner authentication required.' using errcode = '42501';
  end if;

  select moments.slug
  into v_slug
  from public.moments
  where id = p_moment_id
  for update;

  if not found then
    raise exception 'Moment not found.' using errcode = 'P0002';
  end if;

  for v_asset in
    select *
    from public.moment_media_assets
    where moment_id = p_moment_id
    for update
  loop
    v_resource_type := case
      when v_asset.resource_type in ('raw', 'video') then v_asset.resource_type
      else 'image'
    end;

    insert into public.media_cleanup_jobs (
      action,
      created_by,
      next_attempt_at,
      provider,
      public_id,
      resource_type
    )
    values (
      'destroy',
      v_asset.created_by,
      now(),
      'cloudinary',
      v_asset.cloudinary_public_id,
      v_resource_type
    )
    on conflict (provider, action, public_id, resource_type) do nothing;
  end loop;

  delete from public.moment_media_assets
  where moment_id = p_moment_id;

  delete from public.moments
  where id = p_moment_id;

  return query select v_slug;
end;
$$;

create or replace function public.claim_media_cleanup_jobs(p_limit integer default 10)
returns setof public.media_cleanup_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with claimed as (
    select id
    from public.media_cleanup_jobs
    where (
      status = 'queued'
      and coalesce(next_attempt_at, now()) <= now()
    )
    or (
      status = 'processing'
      and locked_at < now() - interval '15 minutes'
    )
    order by next_attempt_at asc nulls first, created_at asc
    limit greatest(1, least(p_limit, 25))
    for update skip locked
  )
  update public.media_cleanup_jobs as jobs
  set
    attempt_count = jobs.attempt_count + 1,
    locked_at = now(),
    status = 'processing'
  from claimed
  where jobs.id = claimed.id
  returning jobs.*;
end;
$$;

create or replace function public.complete_media_cleanup_job(p_job_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.media_cleanup_jobs
  set
    completed_at = now(),
    last_error = null,
    locked_at = null,
    next_attempt_at = null,
    status = 'completed'
  where id = p_job_id;
$$;

create or replace function public.fail_media_cleanup_job(
  p_job_id uuid,
  p_error text,
  p_retry_at timestamptz,
  p_terminal boolean
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.media_cleanup_jobs
  set
    last_error = left(p_error, 2000),
    locked_at = null,
    next_attempt_at = case when p_terminal then null else p_retry_at end,
    status = case when p_terminal then 'failed' else 'queued' end
  where id = p_job_id;
$$;

revoke all on function public.delete_moment_asset_and_enqueue_cleanup(uuid, uuid) from public;
revoke all on function public.delete_moment_and_enqueue_cleanup(uuid) from public;
grant execute on function public.delete_moment_asset_and_enqueue_cleanup(uuid, uuid) to authenticated;
grant execute on function public.delete_moment_and_enqueue_cleanup(uuid) to authenticated;

revoke all on function public.claim_media_cleanup_jobs(integer) from public;
revoke all on function public.complete_media_cleanup_job(uuid) from public;
revoke all on function public.fail_media_cleanup_job(uuid, text, timestamptz, boolean) from public;
grant execute on function public.claim_media_cleanup_jobs(integer) to service_role;
grant execute on function public.complete_media_cleanup_job(uuid) to service_role;
grant execute on function public.fail_media_cleanup_job(uuid, text, timestamptz, boolean) to service_role;
