-- ============================================
-- SocialHub - Initial Schema
-- ============================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- profiles: extends auth.users with business info
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  industry text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "users see their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, business_name)
  values (new.id, new.raw_user_meta_data->>'business_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- social_connections: OAuth tokens per platform per user
-- ============================================
create table public.social_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok')),
  platform_user_id text not null,
  platform_username text,
  -- Facebook Pages have their own access tokens separate from the user token.
  -- page_id is the FB Page ID (also the IG Business Account's parent for IG connections)
  page_id text,
  -- Tokens are stored server-side only via the edge function. Never exposed to the client.
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  connected_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, platform)
);

alter table public.social_connections enable row level security;

-- Users can read their own connections (tokens are NOT selected by the frontend though —
-- we only expose the non-sensitive columns via a view below)
create policy "users see their own connections"
  on public.social_connections for select
  using (auth.uid() = user_id);

create policy "users delete their own connections"
  on public.social_connections for delete
  using (auth.uid() = user_id);

-- Inserts only happen via the edge function (using the service role), so no user insert policy.

-- Safe view for the frontend — omits the access_token column
create view public.social_connections_safe as
  select id, user_id, platform, platform_user_id, platform_username, page_id,
         token_expires_at, scopes, connected_at, updated_at
  from public.social_connections;

-- ============================================
-- posts: scheduled and published posts
-- ============================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  hashtags text,
  platforms text[] not null,
  media_urls text[],
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  scheduled_for timestamptz,
  published_at timestamptz,
  -- Per-platform result after publish
  platform_post_ids jsonb default '{}'::jsonb,
  -- Cached engagement snapshots
  engagement jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "users see their own posts"
  on public.posts for select
  using (auth.uid() = user_id);

create policy "users insert their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "users update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "users delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

create index posts_user_scheduled_idx on public.posts(user_id, scheduled_for) where status = 'scheduled';
create index posts_user_status_idx on public.posts(user_id, status);

-- ============================================
-- updated_at trigger helper
-- ============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger social_connections_updated_at before update on public.social_connections
  for each row execute function public.set_updated_at();

create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
