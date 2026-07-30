-- Persist one collaborative item-list title per tenant.
alter table public.tenants
  add column if not exists items_list_title text;

alter table public.tenants
  drop constraint if exists tenants_items_list_title_check;

alter table public.tenants
  add constraint tenants_items_list_title_check
  check (
    items_list_title is null
    or (
      items_list_title = pg_catalog.btrim(items_list_title)
      and pg_catalog.char_length(items_list_title) between 1 and 80
    )
  );

drop policy if exists "tenants_admin_update" on public.tenants;
create policy "tenants_admin_update"
on public.tenants
for update
to authenticated
using (
  id = (select public.current_tenant_id())
  and (select public.is_admin())
)
with check (
  id = (select public.current_tenant_id())
  and (select public.is_admin())
);

grant update (items_list_title) on public.tenants to authenticated;

-- Realtime broadcasts tenant title updates to authenticated members allowed by RLS.
do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tenants'
  ) then
    execute 'alter publication supabase_realtime add table public.tenants';
  end if;
end;
$$;

comment on column public.tenants.items_list_title is
  'Optional shared title for the tenant collaborative item list.';

notify pgrst, 'reload schema';
