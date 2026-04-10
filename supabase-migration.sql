-- ============================================================
-- NYAAY Database Schema
-- Run this in the Supabase SQL editor
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique,
  phone       text unique,
  full_name   text,
  preferred_language text not null default 'hi'
    check (preferred_language in ('hi', 'en', 'ta', 'te', 'bn')),
  avatar_url  text,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default 'New Conversation',
  status      text not null default 'active'
    check (status in ('active', 'archived', 'deleted')),
  domain      text
    check (domain in ('PROPERTY','LABOR','DOMESTIC_VIOLENCE','CONSUMER','TENANT','CRIMINAL','FAMILY','OTHER')),
  summary     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id                uuid primary key default uuid_generate_v4(),
  conversation_id   uuid not null references public.conversations(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant', 'system')),
  content           text not null,
  audio_url         text,
  language          text not null default 'hi'
    check (language in ('hi', 'en', 'ta', 'te', 'bn')),
  intent            text,
  tokens_used       integer,
  created_at        timestamptz not null default now()
);

create table if not exists public.documents (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  conversation_id   uuid references public.conversations(id) on delete set null,
  type              text not null
    check (type in ('LEGAL_NOTICE','RTI_APPLICATION','POLICE_COMPLAINT','CONSUMER_COMPLAINT','AFFIDAVIT','RENT_AGREEMENT')),
  title             text not null,
  file_url          text,
  data              jsonb not null default '{}',
  language          text not null default 'hi'
    check (language in ('hi', 'en', 'ta', 'te', 'bn')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists conversations_user_id_idx     on public.conversations(user_id);
create index if not exists conversations_status_idx      on public.conversations(status);
create index if not exists conversations_created_at_idx  on public.conversations(created_at desc);
create index if not exists messages_conversation_id_idx  on public.messages(conversation_id);
create index if not exists messages_created_at_idx       on public.messages(created_at);
create index if not exists documents_user_id_idx         on public.documents(user_id);
create index if not exists documents_conversation_id_idx on public.documents(conversation_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.documents     enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view their own conversations"
  on public.conversations for select using (auth.uid() = user_id);
create policy "Users can insert their own conversations"
  on public.conversations for insert with check (auth.uid() = user_id);
create policy "Users can update their own conversations"
  on public.conversations for update using (auth.uid() = user_id);
create policy "Users can delete their own conversations"
  on public.conversations for delete using (auth.uid() = user_id);

create policy "Users can view messages in their conversations"
  on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id and c.user_id = auth.uid()
  ));
create policy "Users can insert messages in their conversations"
  on public.messages for insert
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  ));

create policy "Users can view their own documents"
  on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents"
  on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents"
  on public.documents for update using (auth.uid() = user_id);
create policy "Users can delete their own documents"
  on public.documents for delete using (auth.uid() = user_id);
