-- ======== NEW TABLES ========

-- Follows table
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, author_id)
);

-- Notifications table
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow', 'publish')),
  from_user_id uuid references public.profiles(id) on delete set null,
  article_id uuid references public.articles(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_author on public.follows(author_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);

-- RLS
alter table public.follows enable row level security;
alter table public.notifications enable row level security;

-- Follows policies
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Notifications policies
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (true);
create policy "Users can mark own as read" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on public.notifications for delete using (auth.uid() = user_id);
