-- AVTOGID Supabase schema (повна версія)
-- Виконайте в Supabase SQL Editor

-- === Синхронізація даних користувача ===
create table if not exists public.user_sync_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb,
  lists jsonb not null default '[]'::jsonb,
  cars jsonb not null default '[]'::jsonb,
  active_car_id text,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_sync_data enable row level security;

drop policy if exists "Users read own sync data" on public.user_sync_data;
create policy "Users read own sync data"
  on public.user_sync_data for select using (auth.uid() = user_id);

drop policy if exists "Users upsert own sync data" on public.user_sync_data;
create policy "Users upsert own sync data"
  on public.user_sync_data for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own sync data" on public.user_sync_data;
create policy "Users update own sync data"
  on public.user_sync_data for update using (auth.uid() = user_id);

-- Міграція для існуючих таблиць
alter table public.user_sync_data add column if not exists cars jsonb not null default '[]'::jsonb;
alter table public.user_sync_data add column if not exists active_car_id text;
alter table public.user_sync_data add column if not exists history jsonb not null default '[]'::jsonb;

-- === Push-токени (Expo + FCM) ===
create table if not exists public.user_push_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expo_token text,
  fcm_token text,
  platform text not null default 'android',
  latitude double precision,
  longitude double precision,
  notify_radius_km int not null default 50,
  updated_at timestamptz not null default now()
);

alter table public.user_push_tokens enable row level security;

drop policy if exists "Users manage own push tokens" on public.user_push_tokens;
create policy "Users manage own push tokens"
  on public.user_push_tokens for all using (auth.uid() = user_id);

create index if not exists idx_push_tokens_location
  on public.user_push_tokens (latitude, longitude)
  where latitude is not null;
