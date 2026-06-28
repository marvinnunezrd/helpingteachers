-- Helping Teachers saved data setup
-- Run this in Supabase SQL Editor after Auth is working.

create table if not exists public.teacher_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  title text,
  name text,
  display_name text,
  preferred_language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.teacher_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_profiles'
      and policyname = 'Teachers can read their own profile'
  ) then
    create policy "Teachers can read their own profile"
      on public.teacher_profiles
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_profiles'
      and policyname = 'Teachers can insert their own profile'
  ) then
    create policy "Teachers can insert their own profile"
      on public.teacher_profiles
      for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_profiles'
      and policyname = 'Teachers can update their own profile'
  ) then
    create policy "Teachers can update their own profile"
      on public.teacher_profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

create table if not exists public.teacher_tool_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_key text not null,
  setting_key text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, tool_key, setting_key)
);

alter table public.teacher_tool_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_tool_settings'
      and policyname = 'Teachers can read their own tool settings'
  ) then
    create policy "Teachers can read their own tool settings"
      on public.teacher_tool_settings
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_tool_settings'
      and policyname = 'Teachers can insert their own tool settings'
  ) then
    create policy "Teachers can insert their own tool settings"
      on public.teacher_tool_settings
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_tool_settings'
      and policyname = 'Teachers can update their own tool settings'
  ) then
    create policy "Teachers can update their own tool settings"
      on public.teacher_tool_settings
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_tool_settings'
      and policyname = 'Teachers can delete their own tool settings'
  ) then
    create policy "Teachers can delete their own tool settings"
      on public.teacher_tool_settings
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;