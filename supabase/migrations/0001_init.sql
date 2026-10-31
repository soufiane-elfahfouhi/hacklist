-- Hacklist Core Database Schema
-- Supabase Postgres Migration 0001_init.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  daily_goal int default 5,
  weekly_goal int default 25,
  karma int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PROJECTS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#1F91EB',
  parent_id uuid references public.projects(id) on delete set null,
  view_style text default 'list' check (view_style in ('list', 'board', 'calendar')),
  is_inbox boolean default false,
  is_favorite boolean default false,
  child_order int not null default 0,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. SECTIONS
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  child_order int not null default 0,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TASKS
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  parent_id uuid references public.tasks(id) on delete cascade,
  content text not null,
  description text default '',
  priority smallint not null default 4 check (priority between 1 and 4),
  due_date date,
  due_at timestamptz,
  duration_min int default 30,
  recurrence text,
  deadline date,
  child_order int not null default 0,
  completed_at timestamptz,
  gcal_event_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. LABELS
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#5BADEE',
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- 6. TASK_LABELS (Join table)
create table if not exists public.task_labels (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- 7. COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. REMINDERS
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('absolute', 'relative')),
  remind_at timestamptz,
  minutes_before int,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- 9. ACTIVITY LOG (Unlimited)
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('added', 'updated', 'completed', 'uncompleted', 'deleted', 'commented', 'moved')),
  object_type text not null check (object_type in ('task', 'project', 'section', 'comment')),
  object_id uuid not null,
  object_title text,
  payload jsonb default '{}'::jsonb,
  source text default 'web' check (source in ('web', 'mcp', 'gcal', 'api')),
  created_at timestamptz default now()
);

-- 10. API TOKENS (Antigravity & Automation Access)
create table if not exists public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

-- 11. GOOGLE CONNECTIONS (Two-way Calendar Sync)
create table if not exists public.google_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  refresh_token_enc text not null,
  calendar_id text,
  sync_token text,
  channel_id text,
  channel_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 12. EXTERNAL CALENDAR EVENTS CACHE
create table if not exists public.external_events (
  id text primary key, -- Google event id
  user_id uuid not null references auth.users(id) on delete cascade,
  calendar_id text not null,
  title text not null,
  description text default '',
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_all_day boolean default false,
  updated_at timestamptz default now()
);

-- 13. PUSH SUBSCRIPTIONS (Web Push)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.sections enable row level security;
alter table public.tasks enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;
alter table public.comments enable row level security;
alter table public.reminders enable row level security;
alter table public.activity_log enable row level security;
alter table public.api_tokens enable row level security;
alter table public.google_connections enable row level security;
alter table public.external_events enable row level security;
alter table public.push_subscriptions enable row level security;

-- Policies: Every user accesses ONLY their own rows
create policy "User owns profile" on public.profiles for all using (auth.uid() = id);
create policy "User owns projects" on public.projects for all using (auth.uid() = user_id);
create policy "User owns sections" on public.sections for all using (auth.uid() = user_id);
create policy "User owns tasks" on public.tasks for all using (auth.uid() = user_id);
create policy "User owns labels" on public.labels for all using (auth.uid() = user_id);
create policy "User owns task_labels" on public.task_labels for all using (
  exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
);
create policy "User owns comments" on public.comments for all using (auth.uid() = user_id);
create policy "User owns reminders" on public.reminders for all using (auth.uid() = user_id);
create policy "User owns activity_log" on public.activity_log for all using (auth.uid() = user_id);
create policy "User owns api_tokens" on public.api_tokens for all using (auth.uid() = user_id);
create policy "User owns google_connections" on public.google_connections for all using (auth.uid() = user_id);
create policy "User owns external_events" on public.external_events for all using (auth.uid() = user_id);
create policy "User owns push_subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id);

-- TRIGGER: Auto-create Profile & Default Inbox Project on New User Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  inbox_id uuid;
begin
  -- Insert Profile
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );

  -- Insert default Inbox Project
  insert into public.projects (user_id, name, is_inbox, color, view_style)
  values (new.id, 'Inbox', true, '#1F91EB', 'list')
  returning id into inbox_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
