-- Generalize owner auth for the personal site and add Moments storage.
-- The allowed GitHub owner login is intentionally singular for this project.
create table if not exists public.site_owner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  github_username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.site_owner_accounts enable row level security;

revoke all on table public.site_owner_accounts from anon, authenticated;

insert into public.site_owner_accounts (user_id, github_username)
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
) = 'quan-vo-dinh'
on conflict (user_id) do update
set github_username = excluded.github_username;

create or replace function public.is_site_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.site_owner_accounts
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_site_owner() from public;
grant execute on function public.is_site_owner() to authenticated;

create or replace function public.is_interview_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_site_owner();
$$;

revoke all on function public.is_interview_owner() from public;
grant execute on function public.is_interview_owner() to authenticated;

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

  if lower(coalesce(github_username, '')) = 'quan-vo-dinh' then
    insert into public.site_owner_accounts (user_id, github_username)
    values (new.id, github_username)
    on conflict (user_id) do update
    set github_username = excluded.github_username;

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

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  note_markdown text,
  occurred_at date,
  location text,
  status text not null default 'draft',
  visibility text not null default 'public',
  cover_asset_id uuid,
  tags text[] not null default '{}',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  sort_key timestamptz not null default now(),
  constraint moments_status_check check (status in ('draft', 'published', 'archived')),
  constraint moments_visibility_check check (visibility in ('public', 'private')),
  constraint moments_published_at_check check (
    (status = 'published' and published_at is not null)
    or (status <> 'published')
  )
);

create table if not exists public.moment_media_assets (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid references public.moments(id) on delete set null,
  cloudinary_public_id text not null unique,
  cloudinary_asset_id text,
  resource_type text not null default 'image',
  secure_url text not null,
  width integer,
  height integer,
  format text,
  bytes integer,
  alt text,
  caption text,
  sort_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint moment_media_assets_resource_type_check check (
    resource_type in ('image', 'video', 'raw', 'auto')
  ),
  constraint moment_media_assets_dimensions_check check (
    (width is null or width > 0)
    and (height is null or height > 0)
    and (bytes is null or bytes >= 0)
  )
);

do $$
begin
  alter table public.moments
    add constraint moments_cover_asset_id_fkey
    foreign key (cover_asset_id)
    references public.moment_media_assets(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

create index if not exists moments_public_feed_idx
  on public.moments (sort_key desc, published_at desc)
  where status = 'published' and visibility = 'public';

create index if not exists moment_media_assets_moment_sort_idx
  on public.moment_media_assets (moment_id, sort_order, created_at);

drop trigger if exists set_moments_updated_at on public.moments;
create trigger set_moments_updated_at
before update on public.moments
for each row execute function public.set_updated_at();

drop trigger if exists set_moment_media_assets_updated_at on public.moment_media_assets;
create trigger set_moment_media_assets_updated_at
before update on public.moment_media_assets
for each row execute function public.set_updated_at();

alter table public.moments enable row level security;
alter table public.moment_media_assets enable row level security;

drop policy if exists "Public can read published public moments." on public.moments;
create policy "Public can read published public moments."
on public.moments for select
to anon, authenticated
using (
  status = 'published'
  and visibility = 'public'
);

drop policy if exists "Owner can manage moments." on public.moments;
create policy "Owner can manage moments."
on public.moments for all
to authenticated
using (
  (select public.is_site_owner())
)
with check (
  (select public.is_site_owner())
  and created_by = (select auth.uid())
);

drop policy if exists "Public can read assets attached to published moments." on public.moment_media_assets;
create policy "Public can read assets attached to published moments."
on public.moment_media_assets for select
to anon, authenticated
using (
  exists (
    select 1
    from public.moments
    where moments.id = moment_media_assets.moment_id
      and moments.status = 'published'
      and moments.visibility = 'public'
  )
);

drop policy if exists "Owner can manage moment media assets." on public.moment_media_assets;
create policy "Owner can manage moment media assets."
on public.moment_media_assets for all
to authenticated
using (
  (select public.is_site_owner())
)
with check (
  (select public.is_site_owner())
  and created_by = (select auth.uid())
);
