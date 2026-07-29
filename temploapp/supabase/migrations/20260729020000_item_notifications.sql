-- Each member tracks when they last viewed the collaborative item list.
-- New items after that moment are rendered as an unread notification.
alter table public.profiles
  add column items_last_seen_at timestamptz not null default now();

create index items_tenant_created_at_idx
  on public.items (tenant_id, created_at desc);

create or replace function public.mark_items_notifications_seen()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_tenant_id uuid;
  seen_at timestamptz := pg_catalog.now();
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  actor_tenant_id := public.current_tenant_id();
  if actor_tenant_id is null then
    raise exception 'No se pudo resolver el tenant actual.' using errcode = '28000';
  end if;

  update public.profiles
  set items_last_seen_at = seen_at
  where id = actor_id
    and tenant_id = actor_tenant_id;

  if not found then
    raise exception 'Perfil autenticado no encontrado.' using errcode = '42501';
  end if;

  return seen_at;
end;
$$;

revoke all on function public.mark_items_notifications_seen() from public;
revoke all on function public.mark_items_notifications_seen() from anon;
grant execute on function public.mark_items_notifications_seen() to authenticated;

comment on column public.profiles.items_last_seen_at is
  'Timestamp when the member last opened /dashboard/items.';
comment on function public.mark_items_notifications_seen() is
  'Marks collaborative item notifications as seen for the authenticated member only.';

notify pgrst, 'reload schema';
