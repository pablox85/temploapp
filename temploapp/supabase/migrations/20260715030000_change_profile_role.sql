-- Role changes are serialized so concurrent demotions cannot remove every admin.
create or replace function public.change_profile_role(
  target_profile_id uuid,
  new_role public.app_role
)
returns table (id uuid, role public.app_role, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.app_role;
  target_role public.app_role;
  admin_count bigint;
begin
  if (select auth.uid()) is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  -- One lock for all role changes makes the last-admin check race-safe.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('temploapp.change_profile_role'));

  select role into actor_role
  from public.profiles
  where id = (select auth.uid());
  if actor_role is distinct from 'admin'::public.app_role then
    raise exception 'No tienes permisos para cambiar roles.' using errcode = '42501';
  end if;

  select role into target_role
  from public.profiles
  where id = target_profile_id
  for update;
  if not found then
    raise exception 'El usuario seleccionado no existe.' using errcode = 'P0002';
  end if;

  if target_role = new_role then
    return query select target_profile_id, target_role, false;
    return;
  end if;

  if target_role = 'admin'::public.app_role and new_role = 'user'::public.app_role then
    select count(*) into admin_count from public.profiles where role = 'admin'::public.app_role;
    if admin_count <= 1 then
      raise exception 'No se puede degradar al último administrador.' using errcode = 'P0001';
    end if;
  end if;

  update public.profiles set role = new_role where profiles.id = target_profile_id;
  return query select target_profile_id, new_role, true;
end;
$$;

revoke all on function public.change_profile_role(uuid, public.app_role) from public;
grant execute on function public.change_profile_role(uuid, public.app_role) to authenticated;
