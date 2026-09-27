-- Keep public Moments cursor reads aligned with the exact ordering used by the
-- feed: the timestamp is the primary key and id breaks ties deterministically.
create index if not exists moments_public_feed_cursor_idx
  on public.moments (sort_key desc, id desc)
  where status = 'published' and visibility = 'public';
