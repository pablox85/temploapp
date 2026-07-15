-- TemploAPP is a shared space: authenticated members may resolve assignment
-- owners. Application queries expose only profiles.id and profiles.full_name
-- for this purpose; write permissions remain restricted to administrators.
drop policy if exists "profiles_read_self_or_admin" on public.profiles;
drop policy if exists "profiles_authenticated_read" on public.profiles;

create policy "profiles_authenticated_read"
on public.profiles
for select
to authenticated
using (true);

comment on policy "profiles_authenticated_read" on public.profiles is
  'Allows authenticated members to resolve profile names in the shared item list.';
