-- Provision a tenant and its first administrator from an authenticated
-- SuperAdmin session. Auth credentials remain managed by Supabase Auth.

update public.tenants
set name = pg_catalog.regexp_replace(pg_catalog.btrim(name), '[[:space:]]+', ' ', 'g');

alter table public.tenants
  drop constraint if exists tenants_name_check;

alter table public.tenants
  add constraint tenants_name_check
  check (
    name = pg_catalog.regexp_replace(pg_catalog.btrim(name), '[[:space:]]+', ' ', 'g')
    and pg_catalog.char_length(name) between 1 and 120
  );

create unique index if not exists tenants_normalized_name_key
on public.tenants (
  pg_catalog.lower(
    pg_catalog.regexp_replace(pg_catalog.btrim(name), '[[:space:]]+', ' ', 'g')
  )
);

create or replace function public.prepare_tenant_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := pg_catalog.regexp_replace(
    pg_catalog.btrim(new.name),
    '[[:space:]]+',
    ' ',
    'g'
  );
  return new;
end;
$$;

drop trigger if exists prepare_tenant_name_before_write on public.tenants;
create trigger prepare_tenant_name_before_write
before insert or update of name on public.tenants
for each row execute function public.prepare_tenant_name();

create or replace function public.create_tenant_with_admin(
  tenant_name text,
  target_admin_user_id uuid,
  admin_full_name text
)
returns table (
  tenant_id uuid,
  name text,
  admin_user_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  clean_tenant_name text;
  clean_admin_name text;
  new_tenant_id uuid := gen_random_uuid();
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.super_admins
    where super_admins.user_id = actor_id
  ) then
    raise exception 'No tienes permisos de SuperAdmin.' using errcode = '42501';
  end if;

  clean_tenant_name := pg_catalog.regexp_replace(
    pg_catalog.btrim(tenant_name),
    '[[:space:]]+',
    ' ',
    'g'
  );
  clean_admin_name := pg_catalog.regexp_replace(
    pg_catalog.btrim(admin_full_name),
    '[[:space:]]+',
    ' ',
    'g'
  );

  if pg_catalog.char_length(clean_tenant_name) not between 1 and 120 then
    raise exception 'El nombre del templo no es válido.' using errcode = '22023';
  end if;

  if pg_catalog.char_length(clean_admin_name) not between 1 and 120 then
    raise exception 'El nombre del administrador no es válido.' using errcode = '22023';
  end if;

  if target_admin_user_id is null or not exists (
    select 1
    from auth.users
    where users.id = target_admin_user_id
  ) then
    raise exception 'El usuario administrador no existe.' using errcode = '23503';
  end if;

  if exists (
    select 1
    from public.profiles
    where profiles.id = target_admin_user_id
  ) or exists (
    select 1
    from public.super_admins
    where super_admins.user_id = target_admin_user_id
  ) then
    raise exception 'El usuario administrador ya pertenece a otro acceso.' using errcode = '23505';
  end if;

  begin
    insert into public.tenants (id, name)
    values (new_tenant_id, clean_tenant_name);
  exception
    when unique_violation then
      raise exception 'Ya existe un templo con ese nombre.' using errcode = '23505';
  end;

  insert into public.profiles (id, tenant_id, full_name, role)
  values (
    target_admin_user_id,
    new_tenant_id,
    clean_admin_name,
    'admin'::public.app_role
  );

  return query
  select new_tenant_id, clean_tenant_name, target_admin_user_id;
end;
$$;

revoke all on function public.create_tenant_with_admin(text, uuid, text) from public;
revoke all on function public.create_tenant_with_admin(text, uuid, text) from anon;
grant execute on function public.create_tenant_with_admin(text, uuid, text) to authenticated;

-- Used only by the server-side compensating rollback after authorization.
grant delete on table public.tenants to service_role;

comment on function public.create_tenant_with_admin(text, uuid, text) is
  'Atomically creates a tenant and the initial admin profile after validating the authenticated SuperAdmin.';

notify pgrst, 'reload schema';
