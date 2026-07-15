-- Keep the earliest assignment when upgrading existing data, then enforce one-to-one ownership.
with ranked as (
  select id, row_number() over (partition by user_id order by created_at, id) as position
  from public.user_items
)
delete from public.user_items where id in (select id from ranked where position > 1);

with ranked as (
  select id, row_number() over (partition by item_id order by created_at, id) as position
  from public.user_items
)
delete from public.user_items where id in (select id from ranked where position > 1);

alter table public.user_items
  add constraint user_items_user_id_key unique (user_id),
  add constraint user_items_item_id_key unique (item_id);

-- Inserts are only allowed through the RPCs below. They are atomic and return clear domain errors.
drop policy if exists "user_items_insert_self_or_admin" on public.user_items;
revoke insert on table public.user_items from authenticated;

create or replace function public.select_own_item(target_item_id uuid)
returns table (user_id uuid, item_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('temploapp.exclusive_item_assignment'));

  if not exists (select 1 from public.items where id = target_item_id) then
    raise exception 'El ítem seleccionado no existe.' using errcode = 'P0003';
  end if;
  if exists (select 1 from public.user_items where user_items.user_id = actor_id) then
    raise exception 'Ya tenés un ítem seleccionado.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.user_items where user_items.item_id = target_item_id) then
    raise exception 'Este ítem ya fue seleccionado por otro usuario.' using errcode = 'P0002';
  end if;

  insert into public.user_items (user_id, item_id, assigned_by)
  values (actor_id, target_item_id, actor_id);
  return query select actor_id, target_item_id;
exception
  when unique_violation then
    if exists (select 1 from public.user_items where user_items.user_id = actor_id) then
      raise exception 'Ya tenés un ítem seleccionado.' using errcode = 'P0001';
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
  actor_role public.app_role;
  current_owner_id uuid;
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  select role into actor_role from public.profiles where id = actor_id;
  if actor_role is distinct from 'admin'::public.app_role then
    raise exception 'No tienes permisos para reasignar ítems.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('temploapp.exclusive_item_assignment'));

  if not exists (select 1 from public.items where id = target_item_id) then
    raise exception 'El ítem seleccionado no existe.' using errcode = 'P0003';
  end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'El usuario destino no existe.' using errcode = 'P0004';
  end if;

  select user_items.user_id into current_owner_id
  from public.user_items
  where user_items.item_id = target_item_id
  for update;

  if current_owner_id = target_user_id then
    return query select target_user_id, target_item_id, false;
    return;
  end if;

  if exists (select 1 from public.user_items where user_items.user_id = target_user_id) then
    raise exception 'El usuario destino ya tiene un ítem seleccionado.' using errcode = 'P0001';
  end if;

  delete from public.user_items where user_items.item_id = target_item_id;
  insert into public.user_items (user_id, item_id, assigned_by)
  values (target_user_id, target_item_id, actor_id);
  return query select target_user_id, target_item_id, true;
end;
$$;

revoke all on function public.select_own_item(uuid) from public;
revoke all on function public.reassign_item(uuid, uuid) from public;
grant execute on function public.select_own_item(uuid) to authenticated;
grant execute on function public.reassign_item(uuid, uuid) to authenticated;
