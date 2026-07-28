-- Admin-only extra lists, isolated by the authenticated user's tenant.
create type public.extra_list_type as enum (
  'checklist',
  'inventory',
  'notes'
);

create table public.extra_lists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.current_tenant_id()
    references public.tenants(id) on delete restrict,
  name text not null,
  list_type public.extra_list_type not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint extra_lists_name_length_check
    check (char_length(btrim(name)) between 1 and 120)
);

create unique index extra_lists_tenant_name_key
  on public.extra_lists (tenant_id, lower(btrim(name)));

create index extra_lists_tenant_created_at_idx
  on public.extra_lists (tenant_id, created_at desc);

alter table public.extra_lists enable row level security;

create policy "extra_lists_admin_read"
on public.extra_lists for select to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

create policy "extra_lists_admin_insert"
on public.extra_lists for insert to authenticated
with check (
  tenant_id = (select public.current_tenant_id())
  and created_by = (select auth.uid())
  and (select public.is_admin())
);

revoke all on table public.extra_lists from anon;
revoke all on table public.extra_lists from authenticated;
grant select, insert on table public.extra_lists to authenticated;
grant usage on type public.extra_list_type to authenticated;

comment on table public.extra_lists is
  'Admin-created auxiliary lists isolated by tenant.';

notify pgrst, 'reload schema';
