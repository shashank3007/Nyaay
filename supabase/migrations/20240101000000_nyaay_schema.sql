-- ── Profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  full_name text,
  preferred_language text not null default 'hi',
  avatar_url text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Conversations ─────────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'New Conversation',
  status text not null default 'active',
  domain text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Messages ──────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  language text not null default 'hi',
  intent text,
  tokens_used int,
  audio_url text,
  created_at timestamptz not null default now()
);

-- ── Documents ─────────────────────────────────────────────────
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id),
  type text not null,
  title text not null,
  file_url text,
  data jsonb not null default '{}',
  language text not null default 'hi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.documents     enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users manage own conversations"
  on public.conversations for all using (auth.uid() = user_id);

create policy "Users manage own messages"
  on public.messages for all
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create policy "Users manage own documents"
  on public.documents for all using (auth.uid() = user_id);

-- ── Auto-create profile on signup ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
