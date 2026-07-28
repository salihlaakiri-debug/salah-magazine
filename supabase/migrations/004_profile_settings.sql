-- Add cover_url column to profiles
alter table public.profiles
add column if not exists cover_url text default '';

-- Storage bucket for avatars and covers
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profiles', 'profiles', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Storage RLS: authenticated users can upload their own avatar/cover
create policy "Users can upload their own images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profiles' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profiles' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profiles' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access to profile images
create policy "Anyone can view profile images"
on storage.objects
for select
to public
using (bucket_id = 'profiles');
