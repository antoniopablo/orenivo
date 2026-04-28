-- ═══════════════════════════════════════════════════════════
-- ORENIVO — Supabase Database Schema
-- Run this in the Supabase SQL editor to set up the database
-- ═══════════════════════════════════════════════════════════

-- ── Users (extends auth.users) ──

create table if not exists public.users (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  plan          text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,
  lemon_squeezy_customer_id text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

-- Auto-create user row on first sign-in
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Folders ──

create table if not exists public.folders (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  color       text not null,
  parent_id   text,
  "order"     int not null default 0,
  created_at  bigint not null,
  updated_at  bigint not null default extract(epoch from now())::bigint * 1000,
  deleted_at  bigint
);

alter table public.folders enable row level security;

create policy "Users can manage own folders" on public.folders
  for all using (auth.uid() = user_id);


-- ── Conversations ──

create table if not exists public.conversations (
  id            text not null,
  platform      text not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null,
  url           text not null,
  folder_id     text,
  pinned        boolean not null default false,
  last_accessed bigint not null,
  updated_at    bigint not null default extract(epoch from now())::bigint * 1000,
  deleted_at    bigint,
  primary key (id, platform)
);

alter table public.conversations enable row level security;

create policy "Users can manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);


-- ── Prompt Templates ──

create table if not exists public.prompts (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  text        text not null,
  platform    text not null default 'all',
  folder_id   text,
  created_at  bigint not null,
  updated_at  bigint not null default extract(epoch from now())::bigint * 1000,
  deleted_at  bigint
);

alter table public.prompts enable row level security;

create policy "Users can manage own prompts" on public.prompts
  for all using (auth.uid() = user_id);


-- ── Pending upgrades (for users who paid before signing up) ──

create table if not exists public.pending_upgrades (
  email       text primary key,
  lemon_squeezy_customer_id text,
  created_at  timestamptz default now()
);

-- No RLS needed — only service role writes to this table


-- ── Indexes ──

create index if not exists folders_user_id_idx on public.folders(user_id);
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists prompts_user_id_idx on public.prompts(user_id);
