-- Persistent content for inventory, checklist and notes extra lists.
-- A composite foreign key guarantees that every entry belongs to a list of
-- the same type and tenant.
alter table public.extra_lists
  add constraint extra_lists_tenant_id_id_list_type_key
  unique (tenant_id, id, list_type);

create table public.extra_list_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.current_tenant_id()
    references public.tenants(id) on delete restrict,
  list_id uuid not null,
  entry_type public.extra_list_type not null,
  title text not null,
  content text,
  quantity integer,
  is_completed boolean,
  position integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint extra_list_entries_list_fkey
    foreign key (tenant_id, list_id, entry_type)
    references public.extra_lists(tenant_id, id, list_type)
    on delete cascade,
  constraint extra_list_entries_title_length_check
    check (char_length(btrim(title)) between 1 and 200),
  constraint extra_list_entries_position_check
    check (position >= 0),
  constraint extra_list_entries_type_fields_check
    check (
      (
        entry_type = 'inventory'::public.extra_list_type
        and content is null
        and quantity between 0 and 999999
        and is_completed is null
      )
      or (
        entry_type = 'checklist'::public.extra_list_type
        and content is null
        and quantity is null
        and is_completed is not null
      )
      or (
        entry_type = 'notes'::public.extra_list_type
        and content is not null
        and char_length(btrim(content)) between 1 and 5000
        and quantity is null
        and is_completed is null
      )
    )
);

create index extra_list_entries_list_order_idx
  on public.extra_list_entries (tenant_id, list_id, position, created_at);

create unique index extra_list_entries_inventory_title_key
  on public.extra_list_entries (tenant_id, list_id, lower(btrim(title)))
  where entry_type = 'inventory'::public.extra_list_type;

create or replace function public.prepare_extra_list_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.title := pg_catalog.regexp_replace(pg_catalog.btrim(new.title), '[[:space:]]+', ' ', 'g');

  if new.content is not null then
    new.content := pg_catalog.btrim(new.content);
  end if;

  if tg_op = 'UPDATE' then
    new.updated_at := pg_catalog.now();
  end if;

  return new;
end;
$$;

create trigger prepare_extra_list_entry_before_write
before insert or update of title, content, quantity, is_completed, position
on public.extra_list_entries
for each row execute function public.prepare_extra_list_entry();

alter table public.extra_list_entries enable row level security;

create policy "extra_list_entries_admin_read"
on public.extra_list_entries
for select
to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

create policy "extra_list_entries_admin_insert"
on public.extra_list_entries
for insert
to authenticated
with check (
  tenant_id = (select public.current_tenant_id())
  and created_by = (select auth.uid())
  and (select public.is_admin())
);

create policy "extra_list_entries_admin_update"
on public.extra_list_entries
for update
to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
)
with check (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

create policy "extra_list_entries_admin_delete"
on public.extra_list_entries
for delete
to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

revoke all on table public.extra_list_entries from anon;
revoke all on table public.extra_list_entries from authenticated;

grant select, insert, delete on table public.extra_list_entries to authenticated;
grant update (title, content, quantity, is_completed, position)
  on table public.extra_list_entries to authenticated;

comment on table public.extra_list_entries is
  'Tenant-isolated content for inventory, checklist and notes extra lists.';
comment on column public.extra_list_entries.title is
  'Inventory item name, checklist task, or note title depending on entry_type.';

notify pgrst, 'reload schema';
