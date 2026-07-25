-- Salha Magazine - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text default '',
  avatar_url text default '',
  role text default 'reader' check (role in ('reader', 'writer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Articles table (published works + submissions)
create table public.articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  excerpt text default '',
  section text not null check (section in ('شعر', 'قصة', 'نثر', 'مقالات', 'تأملات')),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'مجهول',
  status text default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  read_time text default '3 دقائق',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments table
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Bookmarks table
create table public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

-- Likes table
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

-- Indexes for performance
create index idx_articles_section on public.articles(section);
create index idx_articles_status on public.articles(status);
create index idx_articles_author_id on public.articles(author_id);
create index idx_articles_published_at on public.articles(published_at desc);
create index idx_comments_article_id on public.comments(article_id);
create index idx_bookmarks_user_id on public.bookmarks(user_id);
create index idx_likes_article_id on public.likes(article_id);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.likes enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Articles policies
create policy "Published articles are viewable by everyone" on public.articles
  for select using (status = 'published' or auth.uid() = author_id);

create policy "Authenticated users can insert articles" on public.articles
  for insert with check (auth.uid() = author_id);

create policy "Users can update own articles" on public.articles
  for update using (auth.uid() = author_id);

create policy "Admins can update any article" on public.articles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete any article" on public.articles
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Comments policies
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Authenticated users can insert comments" on public.comments
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

create policy "Admins can delete any comment" on public.comments
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Bookmarks policies
create policy "Users can view own bookmarks" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy "Users can insert own likes" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own likes" on public.likes
  for delete using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'reader'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed initial admin user (you'll need to create this user in Supabase Auth first)
-- Then run: UPDATE profiles SET role = 'admin' WHERE username = 'admin';

-- Seed articles (optional - for initial data)
-- You can run the seed script after setting up the admin user
