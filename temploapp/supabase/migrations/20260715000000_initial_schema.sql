-- TemploAPP: schema, integrity rules and row-level authorization.
create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_normalized_full_name_key
on public.profiles ((lower(regexp_replace(trim(full_name), '[[:space:]]+', ' ', 'g'))));

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  normalized_name text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_normalized_name_key unique (normalized_name)
);

create table if not exists public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint user_items_user_id_item_id_key unique (user_id, item_id)
);

create index if not exists user_items_item_id_idx on public.user_items(item_id);
create index if not exists user_items_user_id_idx on public.user_items(user_id);
create index if not exists items_created_by_idx on public.items(created_by);

create or replace function public.normalize_item_name(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select lower(regexp_replace(trim(value), '[[:space:]]+', ' ', 'g'));
$$;

create or replace function public.prepare_item()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := regexp_replace(trim(new.name), '[[:space:]]+', ' ', 'g');
  new.normalized_name := public.normalize_item_name(new.name);
  if new.normalized_name = '' then
    raise exception 'El nombre del ítem no puede estar vacío' using errcode = '22023';
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists prepare_item_before_write on public.items;
create trigger prepare_item_before_write
before insert or update of name on public.items
for each row execute function public.prepare_item();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Usuario')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles when applying the migration to a project that already has users.
insert into public.profiles (id, full_name)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), split_part(email, '@', 1), 'Usuario')
from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.user_items enable row level security;

drop policy if exists "profiles_read_self_or_admin" on public.profiles;
create policy "profiles_read_self_or_admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "items_authenticated_read" on public.items;
create policy "items_authenticated_read"
on public.items for select to authenticated
using (true);

drop policy if exists "items_authenticated_insert" on public.items;
create policy "items_authenticated_insert"
on public.items for insert to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists "items_admin_update" on public.items;
create policy "items_admin_update"
on public.items for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "items_admin_delete" on public.items;
create policy "items_admin_delete"
on public.items for delete to authenticated
using ((select public.is_admin()));

-- Assignment rows are readable so every authenticated member can see selection counts.
-- Profile details remain private unless the caller is an administrator.
drop policy if exists "user_items_authenticated_read" on public.user_items;
create policy "user_items_authenticated_read"
on public.user_items for select to authenticated
using (true);

drop policy if exists "user_items_insert_self_or_admin" on public.user_items;
create policy "user_items_insert_self_or_admin"
on public.user_items for insert to authenticated
with check (
  assigned_by = (select auth.uid())
  and (user_id = (select auth.uid()) or (select public.is_admin()))
);

drop policy if exists "user_items_delete_self_or_admin" on public.user_items;
create policy "user_items_delete_self_or_admin"
on public.user_items for delete to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

revoke all on table public.profiles, public.items, public.user_items from anon;
grant select on table public.profiles, public.items, public.user_items to authenticated;
grant insert on table public.items, public.user_items to authenticated;
grant update on table public.items, public.profiles to authenticated;
grant delete on table public.items, public.user_items to authenticated;

comment on column public.items.normalized_name is
  'Lower-case, trimmed name with runs of whitespace collapsed; maintained by trigger.';
