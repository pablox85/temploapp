-- Keep assignment ownership private: a member may read only their own profile,
-- while administrators may read profiles in their current tenant.
alter table public.profiles enable row level security;

drop policy if exists "profiles_assignment_read" on public.profiles;
drop policy if exists "profiles_authenticated_read" on public.profiles;
drop policy if exists "profiles_read_self_or_admin" on public.profiles;
drop policy if exists "profiles_owner_visibility" on public.profiles;

create policy "profiles_owner_visibility"
on public.profiles
for select
to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (
    id = (select auth.uid())
    or (select public.is_admin())
  )
);

comment on policy "profiles_owner_visibility" on public.profiles is
  'Members can read only their own profile; administrators can read profiles in their current tenant.';
