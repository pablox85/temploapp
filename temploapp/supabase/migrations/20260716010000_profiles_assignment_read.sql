-- Allow authenticated members to resolve the assigned user's name in item
-- listings. This migration changes SELECT access only; it grants no write
-- permissions and does not change any INSERT, UPDATE, or DELETE policy.
alter table public.profiles enable row level security;

drop policy if exists "profiles_read_self_or_admin" on public.profiles;
-- The previous multi-tenant migration uses this name. Dropping it here makes
-- this migration safe to apply on either migration history.
drop policy if exists "profiles_authenticated_read" on public.profiles;
drop policy if exists "profiles_assignment_read" on public.profiles;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'tenant_id'
  ) and to_regprocedure('public.current_tenant_id()') is not null then
    execute $policy$
      create policy "profiles_assignment_read"
      on public.profiles
      for select
      to authenticated
      using (tenant_id = (select public.current_tenant_id()))
    $policy$;
  else
    -- Before tenant support exists, the safest compatible behavior is to keep
    -- profile details private to the caller. The multi-tenant migration must
    -- replace this condition with tenant_id = current_tenant_id().
    execute $policy$
      create policy "profiles_assignment_read"
      on public.profiles
      for select
      to authenticated
      using (id = (select auth.uid()))
    $policy$;
  end if;
end;
$$;

comment on policy "profiles_assignment_read" on public.profiles is
  'Authenticated members may read profile names needed to show who selected an item; this does not grant INSERT, UPDATE, or DELETE access.';
