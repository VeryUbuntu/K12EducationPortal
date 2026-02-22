-- 1. Enable pgcrypto for UUIDs if not already enabled
create extension if not exists "pgcrypto";

-- 2. Create tables
-- profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'student'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- stages table
create table public.stages (
  id serial primary key,
  slug text unique not null,
  name text not null
);

-- subjects table
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  stage_slug text references public.stages(slug) on delete cascade not null,
  slug text not null,
  name text not null,
  icon_name text not null,
  unique (stage_slug, slug)
);

-- resources table
create type resource_type as enum ('web_app', 'file', 'link');
create type access_level as enum ('public', 'registered');

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  description text,
  type resource_type not null,
  url text not null,
  is_featured boolean default false,
  access_level access_level default 'public' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.stages enable row level security;
alter table public.subjects enable row level security;
alter table public.resources enable row level security;

-- Profiles: Users can read their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = id );

-- Stages: Anyone can read
create policy "Stages are viewable by everyone" 
  on public.stages for select 
  using ( true );

-- Subjects: Anyone can read
create policy "Subjects are viewable by everyone" 
  on public.subjects for select 
  using ( true );

-- Resources: Anyone can read
create policy "Resources are viewable by everyone" 
  on public.resources for select 
  using ( true );

-- Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
