-- Add per-user monthly token tracking to profiles
alter table public.profiles
  add column if not exists monthly_tokens_used integer not null default 0,
  add column if not exists tokens_month        text    not null default to_char(now(), 'YYYY-MM');
