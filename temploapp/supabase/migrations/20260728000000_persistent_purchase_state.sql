-- Persist the shared purchase state while preserving tenant and role rules.
alter table public.items
  add column if not exists is_purchased boolean not null default false,
  add column if not exists purchased_by uuid references auth.users(id) on delete set null,
  add column if not exists purchased_at timestamptz;

create or replace function public.set_items_purchase_state(
  target_item_ids uuid[],
  purchased boolean
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_tenant_id uuid;
  actor_role public.app_role;
  clean_item_ids uuid[];
  matching_items integer;
  updated_items integer;
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  if purchased is null then
    raise exception 'El estado de compra es inválido.' using errcode = '22023';
  end if;

  select pg_catalog.array_agg(candidate_id order by candidate_id)
  into clean_item_ids
  from (
    select distinct candidate_id
    from pg_catalog.unnest(target_item_ids) as ids(candidate_id)
    where candidate_id is not null
  ) as unique_ids;

  if clean_item_ids is null
    or pg_catalog.cardinality(clean_item_ids) = 0
    or pg_catalog.cardinality(clean_item_ids) > 100 then
    raise exception 'Selecciona entre 1 y 100 ítems válidos.' using errcode = '22023';
  end if;

  actor_tenant_id := public.current_tenant_id();
  if actor_tenant_id is null then
    raise exception 'No se pudo resolver el tenant actual.' using errcode = '28000';
  end if;

  select profiles.role
  into actor_role
  from public.profiles
  where profiles.id = actor_id
    and profiles.tenant_id = actor_tenant_id;

  if actor_role is null then
    raise exception 'Perfil autenticado no encontrado.' using errcode = '42501';
  end if;

  perform 1
  from public.items
  where items.tenant_id = actor_tenant_id
    and items.id = any(clean_item_ids)
  order by items.id
  for update;

  select count(*)::integer
  into matching_items
  from public.items
  where items.tenant_id = actor_tenant_id
    and items.id = any(clean_item_ids);

  if matching_items <> pg_catalog.cardinality(clean_item_ids) then
    raise exception 'Uno o más ítems no existen en el tenant actual.' using errcode = 'P0003';
  end if;

  if actor_role <> 'admin' and exists (
    select 1
    from pg_catalog.unnest(clean_item_ids) as requested(requested_item_id)
    where not exists (
      select 1
      from public.user_items
      where user_items.tenant_id = actor_tenant_id
        and user_items.user_id = actor_id
        and user_items.item_id = requested_item_id
    )
  ) then
    raise exception 'Solo puedes cambiar el estado de tus propios ítems.' using errcode = '42501';
  end if;

  update public.items
  set
    is_purchased = purchased,
    purchased_by = case when purchased then actor_id else null end,
    purchased_at = case when purchased then pg_catalog.now() else null end,
    updated_at = pg_catalog.now()
  where items.tenant_id = actor_tenant_id
    and items.id = any(clean_item_ids);

  get diagnostics updated_items = row_count;
  return updated_items;
end;
$$;

revoke all on function public.set_items_purchase_state(uuid[], boolean) from public;
revoke all on function public.set_items_purchase_state(uuid[], boolean) from anon;
grant execute on function public.set_items_purchase_state(uuid[], boolean) to authenticated;

comment on function public.set_items_purchase_state(uuid[], boolean) is
  'Updates purchase state atomically. Admins may update tenant items; members may update only their assigned items.';

notify pgrst, 'reload schema';
