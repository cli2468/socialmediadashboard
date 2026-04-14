-- ============================================
-- trend_briefs: AI-generated content briefs from analyzed social videos
-- ============================================
create table public.trend_briefs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  platform text not null check (platform in ('tiktok', 'instagram', 'facebook', 'youtube', 'unknown')),
  title text,
  uploader text,
  thumbnail text,
  view_count bigint,
  like_count bigint,
  comment_count bigint,
  duration integer,
  upload_date text,
  comments_scraped integer default 0,
  -- Full Gemini analysis JSON: summary, hook, format, why_it_works, how_to_recreate, etc.
  analysis jsonb not null,
  model text,
  created_at timestamptz default now() not null
);

alter table public.trend_briefs enable row level security;

create policy "users see their own briefs"
  on public.trend_briefs for select
  using (auth.uid() = user_id);

create policy "users insert their own briefs"
  on public.trend_briefs for insert
  with check (auth.uid() = user_id);

create policy "users delete their own briefs"
  on public.trend_briefs for delete
  using (auth.uid() = user_id);

create index trend_briefs_user_created_idx on public.trend_briefs(user_id, created_at desc);
