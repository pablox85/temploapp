-- Add tenant isolation without changing existing identities or application flows.
create table if not exists public.tenants (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.tenants (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Templo Principal')
on conflict (id) do nothing;

-- Columns stay nullable while existing rows are assigned to the initial tenant.
alter table public.profiles add column if not exists tenant_id uuid;
alter table public.items add column if not exists tenant_id uuid;
alter table public.user_items add column if not exists tenant_id uuid;

update public.profiles
set tenant_id = '00000000-0000-0000-0000-000000000001'
where tenant_id is null;

update public.items
set tenant_id = '00000000-0000-0000-0000-000000000001'
where tenant_id is null;

update public.user_items
set tenant_id = '00000000-0000-0000-0000-000000000001'
where tenant_id is null;

-- Replace global uniqueness with tenant-local uniqueness.
alter table public.items
  drop constraint if exists items_normalized_name_key;
alter table public.items
  add constraint items_normalized_name_key unique (tenant_id, normalized_name);

alter table public.user_items
  drop constraint if exists user_items_user_id_item_id_key,
  drop constraint if exists user_items_user_id_key,
  drop constraint if exists user_items_item_id_key;
alter table public.user_items
  add constraint user_items_user_id_item_id_key unique (tenant_id, user_id, item_id),
  add constraint user_items_user_id_key unique (tenant_id, user_id),
  add constraint user_items_item_id_key unique (tenant_id, item_id);

-- Composite keys make cross-tenant references structurally impossible.
alter table public.profiles
  add constraint profiles_tenant_id_id_key unique (tenant_id, id);
alter table public.items
  add constraint items_tenant_id_id_key unique (tenant_id, id);

alter table public.items
  drop constraint if exists items_created_by_fkey;
alter table public.user_items
  drop constraint if exists user_items_user_id_fkey,
  drop constraint if exists user_items_item_id_fkey,
  drop constraint if exists user_items_assigned_by_fkey;

alter table public.profiles
  add constraint profiles_tenant_id_fkey
    foreign key (tenant_id) references public.tenants(id) on delete restrict;
alter table public.items
  add constraint items_tenant_id_fkey
    foreign key (tenant_id) references public.tenants(id) on delete restrict,
  add constraint items_created_by_fkey
    foreign key (tenant_id, created_by)
    references public.profiles(tenant_id, id) on delete restrict;
alter table public.user_items
  add constraint user_items_tenant_id_fkey
    foreign key (tenant_id) references public.tenants(id) on delete restrict,
  add constraint user_items_user_id_fkey
    foreign key (tenant_id, user_id)
    references public.profiles(tenant_id, id) on delete cascade,
  add constraint user_items_item_id_fkey
    foreign key (tenant_id, item_id)
    references public.items(tenant_id, id) on delete cascade,
  add constraint user_items_assigned_by_fkey
    foreign key (tenant_id, assigned_by)
    references public.profiles(tenant_id, id) on delete restrict;

drop index if exists public.items_created_by_idx;
drop index if exists public.user_items_item_id_idx;
drop index if exists public.user_items_user_id_idx;

create index profiles_tenant_id_idx on public.profiles(tenant_id);
create index items_tenant_id_idx on public.items(tenant_id);
create index items_created_by_idx on public.items(tenant_id, created_by);
create index user_items_tenant_id_idx on public.user_items(tenant_id);
create index user_items_item_id_idx on public.user_items(tenant_id, item_id);
create index user_items_user_id_idx on public.user_items(tenant_id, user_id);

alter table public.profiles alter column tenant_id set not null;
alter table public.items alter column tenant_id set not null;
alter table public.user_items alter column tenant_id set not null;

-- RLS calls this function, so SECURITY DEFINER avoids recursive profile policies.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select tenant_id
  from public.profiles
  where id = (select auth.uid());
$$;

revoke all on function public.current_tenant_id() from public;
grant execute on function public.current_tenant_id() to authenticated;

-- Inserts made with an authenticated client derive tenancy in the database.
alter table public.profiles
  alter column tenant_id set default public.current_tenant_id();
alter table public.items
  alter column tenant_id set default public.current_tenant_id();
alter table public.user_items
  alter column tenant_id set default public.current_tenant_id();

-- Auth user creation has no end-user JWT. The server supplies immutable app
-- metadata after resolving the administrator's tenant from their profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_tenant_id uuid;
  tenant_count bigint;
  tenant_value text := nullif(new.raw_app_meta_data ->> 'tenant_id', '');
begin
  if tenant_value is not null then
    begin
      profile_tenant_id := tenant_value::uuid;
    exception
      when invalid_text_representation then
        raise exception 'El tenant del usuario no es válido.' using errcode = '22023';
    end;

    if not exists (select 1 from public.tenants where id = profile_tenant_id) then
      raise exception 'El tenant del usuario no existe.' using errcode = '23503';
    end if;
  else
    -- Preserve the existing single-tenant creation flow during deployment, but
    -- fail closed once more than one tenant exists.
    select count(*) into tenant_count from public.tenants;
    if tenant_count <> 1 then
      raise exception 'No se pudo resolver el tenant del nuevo usuario.' using errcode = '22023';
    end if;
    select id into profile_tenant_id from public.tenants limit 1;
  end if;

  insert into public.profiles (id, full_name, tenant_id)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Usuario'),
    profile_tenant_id
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Elevated helpers remain scoped explicitly because SECURITY DEFINER bypasses RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and tenant_id = public.current_tenant_id()
      and role = 'admin'
  );
$$;

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
  actor_id uuid := (select auth.uid());
  actor_tenant_id uuid;
  actor_role public.app_role;
  target_role public.app_role;
  admin_count bigint;
begin
  if actor_id is null then
    raise exception 'Sesión expirada.' using errcode = '28000';
  end if;

  actor_tenant_id := public.current_tenant_id();
  if actor_tenant_id is null then
    raise exception 'No se pudo resolver el tenant actual.' using errcode = '28000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('temploapp.change_profile_role'),
    pg_catalog.hashtext(actor_tenant_id::text)
  );

  select profiles.role into actor_role
  from public.profiles
  where profiles.id = actor_id
    and profiles.tenant_id = actor_tenant_id;
  if actor_role is distinct from 'admin'::public.app_role then
    raise exception 'No tienes permisos para cambiar roles.' using errcode = '42501';
  end if;

  select profiles.role into target_role
  from public.profiles
  where profiles.id = target_profile_id
    and profiles.tenant_id = actor_tenant_id
  for update;
  if not found then
    raise exception 'El usuario seleccionado no existe.' using errcode = 'P0002';
  end if;

  if target_role = new_role then
    return query select target_profile_id, target_role, false;
    return;
  end if;

  if target_role = 'admin'::public.app_role and new_role = 'user'::public.app_role then
    select count(*) into admin_count
    from public.profiles
    where profiles.tenant_id = actor_tenant_id
      and profiles.role = 'admin'::public.app_role;
    if admin_count <= 1 then
      raise exception 'No se puede degradar al último administrador.' using errcode = 'P0001';
    end if;
  end if;

  update public.profiles
  set role = new_role
  where profiles.id = target_profile_id
    and profiles.tenant_id = actor_tenant_id;
  return query select target_profile_id, new_role, true;
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
      and user_items.tenant_id = actor_tenant_id
  ) then
    raise exception 'Ya tenés un ítem seleccionado.' using errcode = 'P0001';
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
        and user_items.tenant_id = actor_tenant_id
    ) then
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

  if exists (
    select 1 from public.user_items
    where user_items.user_id = target_user_id
      and user_items.tenant_id = actor_tenant_id
  ) then
    raise exception 'El usuario destino ya tiene un ítem seleccionado.' using errcode = 'P0001';
  end if;

  delete from public.user_items
  where user_items.item_id = target_item_id
    and user_items.tenant_id = actor_tenant_id;
  insert into public.user_items (tenant_id, user_id, item_id, assigned_by)
  values (actor_tenant_id, target_user_id, target_item_id, actor_id);
  return query select target_user_id, target_item_id, true;
end;
$$;

-- Rebuild every policy so tenant isolation and the existing role rules are ANDed.
alter table public.tenants enable row level security;

drop policy if exists "tenants_read_current" on public.tenants;
create policy "tenants_read_current"
on public.tenants for select to authenticated
using (id = (select public.current_tenant_id()));

drop policy if exists "profiles_read_self_or_admin" on public.profiles;
drop policy if exists "profiles_authenticated_read" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "profiles_tenant_insert" on public.profiles;
drop policy if exists "profiles_tenant_delete" on public.profiles;

create policy "profiles_authenticated_read"
on public.profiles for select to authenticated
using (tenant_id = (select public.current_tenant_id()));

create policy "profiles_tenant_insert"
on public.profiles for insert to authenticated
with check (
  tenant_id = (select public.current_tenant_id())
  and id = (select auth.uid())
);

create policy "profiles_admin_update"
on public.profiles for update to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
)
with check (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

create policy "profiles_tenant_delete"
on public.profiles for delete to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

drop policy if exists "items_authenticated_read" on public.items;
drop policy if exists "items_authenticated_insert" on public.items;
drop policy if exists "items_admin_update" on public.items;
drop policy if exists "items_admin_delete" on public.items;

create policy "items_authenticated_read"
on public.items for select to authenticated
using (tenant_id = (select public.current_tenant_id()));

create policy "items_authenticated_insert"
on public.items for insert to authenticated
with check (
  tenant_id = (select public.current_tenant_id())
  and created_by = (select auth.uid())
);

create policy "items_admin_update"
on public.items for update to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
)
with check (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

create policy "items_admin_delete"
on public.items for delete to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

drop policy if exists "user_items_authenticated_read" on public.user_items;
drop policy if exists "user_items_insert_self_or_admin" on public.user_items;
drop policy if exists "user_items_delete_self_or_admin" on public.user_items;
drop policy if exists "user_items_update_self_or_admin" on public.user_items;

create policy "user_items_authenticated_read"
on public.user_items for select to authenticated
using (tenant_id = (select public.current_tenant_id()));

create policy "user_items_insert_self_or_admin"
on public.user_items for insert to authenticated
with check (
  tenant_id = (select public.current_tenant_id())
  and assigned_by = (select auth.uid())
  and (user_id = (select auth.uid()) or (select public.is_admin()))
);

create policy "user_items_update_self_or_admin"
on public.user_items for update to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (user_id = (select auth.uid()) or (select public.is_admin()))
)
with check (
  tenant_id = (select public.current_tenant_id())
  and assigned_by = (select auth.uid())
  and (user_id = (select auth.uid()) or (select public.is_admin()))
);

create policy "user_items_delete_self_or_admin"
on public.user_items for delete to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (user_id = (select auth.uid()) or (select public.is_admin()))
);

revoke all on table public.tenants from anon;
grant select on table public.tenants to authenticated;

comment on table public.tenants is 'Temples whose data is isolated by tenant-aware RLS.';
comment on function public.current_tenant_id() is
  'Resolves the authenticated user tenant exclusively from profiles.tenant_id.';
