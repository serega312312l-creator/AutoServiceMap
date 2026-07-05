-- AVTOGID Supabase schema
-- Run in Supabase SQL Editor after creating a project

create table if not exists public.user_sync_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb,
  lists jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_sync_data enable row level security;

create policy "Users read own sync data"
  on public.user_sync_data for select
  using (auth.uid() = user_id);

create policy "Users upsert own sync data"
  on public.user_sync_data for insert
  with check (auth.uid() = user_id);

create policy "Users update own sync data"
  on public.user_sync_data for update
  using (auth.uid() = user_id);
