-- ============================================
-- SocialHub - Storage bucket for post media
-- ============================================
-- Run this AFTER 001_initial_schema.sql
-- This creates a public bucket 'post-media' so that Instagram can fetch
-- image URLs (IG's Graph API requires public URLs for posts).
-- Users can only upload/delete files in their own {user_id}/ folder.

insert into storage.buckets (id, name, public)
  values ('post-media', 'post-media', true)
  on conflict (id) do nothing;

-- Allow users to upload to their own folder: post-media/{auth.uid()}/...
create policy "users upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
create policy "users delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can read (bucket is public, but RLS still requires a select policy)
create policy "public read of post media"
  on storage.objects for select
  using (bucket_id = 'post-media');
