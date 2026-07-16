-- Allow each user to own multiple items while preserving one owner per item.
alter table public.user_items
  drop constraint if exists user_items_user_id_key;

-- Keep both invariants explicit for databases whose migration history may have
-- been applied partially: no duplicate assignment and one owner per item.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.user_items'::regclass
      and conname = 'user_items_user_id_item_id_key'
  ) then
    alter table public.user_items
      add constraint user_items_user_id_item_id_key
      unique (tenant_id, user_id, item_id);
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.user_items'::regclass
      and conname = 'user_items_item_id_key'
  ) then
    alter table public.user_items
      add constraint user_items_item_id_key unique (tenant_id, item_id);
  end if;
end;
$$;

create or replace function public.select_own_item(target_item_id uuid)
returns table (user_id uuid, item_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_tenant_id uuid;
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  actor_tenant_id := public.current_tenant_id();
  if actor_tenant_id is null then
    raise exception 'No se pudo resolver el tenant actual.' using errcode = '28000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('temploapp.exclusive_item_assignment'),
    pg_catalog.hashtext(actor_tenant_id::text)
  );

  if not exists (
    select 1 from public.items
    where items.id = target_item_id
      and items.tenant_id = actor_tenant_id
  ) then
    raise exception 'El ítem seleccionado no existe.' using errcode = 'P0003';
  end if;
  if exists (
    select 1 from public.user_items
    where user_items.user_id = actor_id
      and user_items.item_id = target_item_id
      and user_items.tenant_id = actor_tenant_id
  ) then
    raise exception 'Ya seleccionaste este ítem.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.user_items
    where user_items.item_id = target_item_id
      and user_items.tenant_id = actor_tenant_id
  ) then
    raise exception 'Este ítem ya fue seleccionado por otro usuario.' using errcode = 'P0002';
  end if;

  insert into public.user_items (tenant_id, user_id, item_id, assigned_by)
  values (actor_tenant_id, actor_id, target_item_id, actor_id);
  return query select actor_id, target_item_id;
exception
  when unique_violation then
    if exists (
      select 1 from public.user_items
      where user_items.user_id = actor_id
        and user_items.item_id = target_item_id
        and user_items.tenant_id = actor_tenant_id
    ) then
      raise exception 'Ya seleccionaste este ítem.' using errcode = 'P0001';
    end if;
    raise exception 'Este ítem ya fue seleccionado por otro usuario.' using errcode = 'P0002';
end;
$$;

create or replace function public.reassign_item(
  target_item_id uuid,
  target_user_id uuid
)
returns table (user_id uuid, item_id uuid, changed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_tenant_id uuid;
  actor_role public.app_role;
  current_owner_id uuid;
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  actor_tenant_id := public.current_tenant_id();
  if actor_tenant_id is null then
    raise exception 'No se pudo resolver el tenant actual.' using errcode = '28000';
  end if;

  select profiles.role into actor_role
  from public.profiles
  where profiles.id = actor_id
    and profiles.tenant_id = actor_tenant_id;
  if actor_role is distinct from 'admin'::public.app_role then
    raise exception 'No tienes permisos para reasignar ítems.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('temploapp.exclusive_item_assignment'),
    pg_catalog.hashtext(actor_tenant_id::text)
  );

  if not exists (
    select 1 from public.items
    where items.id = target_item_id
      and items.tenant_id = actor_tenant_id
  ) then
    raise exception 'El ítem seleccionado no existe.' using errcode = 'P0003';
  end if;
  if not exists (
    select 1 from public.profiles
    where profiles.id = target_user_id
      and profiles.tenant_id = actor_tenant_id
  ) then
    raise exception 'El usuario destino no existe.' using errcode = 'P0004';
  end if;

  select user_items.user_id into current_owner_id
  from public.user_items
  where user_items.item_id = target_item_id
    and user_items.tenant_id = actor_tenant_id
  for update;

  if current_owner_id = target_user_id then
    return query select target_user_id, target_item_id, false;
    return;
  end if;

  delete from public.user_items
  where user_items.item_id = target_item_id
    and user_items.tenant_id = actor_tenant_id;
  insert into public.user_items (tenant_id, user_id, item_id, assigned_by)
  values (actor_tenant_id, target_user_id, target_item_id, actor_id);
  return query select target_user_id, target_item_id, true;
end;
$$;

revoke all on function public.select_own_item(uuid) from public;
revoke all on function public.reassign_item(uuid, uuid) from public;
grant execute on function public.select_own_item(uuid) to authenticated;
grant execute on function public.reassign_item(uuid, uuid) to authenticated;
