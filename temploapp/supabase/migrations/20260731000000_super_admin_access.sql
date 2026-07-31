-- Global SuperAdmin authorization for accounts authenticated by Supabase Auth.
-- Email and password remain exclusively in auth.users; this table is only an
-- allow-list and intentionally has no tenant_id.
create table if not exists public.super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now()
);

alter table public.super_admins enable row level security;

-- Browser clients cannot enumerate or mutate global administrators. Future
-- provisioning must use a trusted server-only client or an authorized SQL
-- operation. Membership checks go through is_super_admin().
revoke all on table public.super_admins from public;
revoke all on table public.super_admins from anon;
revoke all on table public.super_admins from authenticated;
grant select, insert, delete on table public.super_admins to service_role;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.super_admins
      where super_admins.user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.is_super_admin() from anon;
grant execute on function public.is_super_admin() to authenticated;

comment on table public.super_admins is
  'Global SuperAdmin allow-list. Authentication remains in Supabase Auth.';
comment on function public.is_super_admin() is
  'Returns whether the current authenticated user belongs to the global SuperAdmin allow-list.';

notify pgrst, 'reload schema';
