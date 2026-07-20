-- Preserve tenant data when an Auth user is deleted administratively.
-- Abort if the prerequisite cascades are not present: deleting auth.users must
-- delete its profile, and deleting that profile must release owned item rows.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    join pg_catalog.pg_class referenced_table
      on referenced_table.oid = constraint_record.confrelid
    join pg_catalog.pg_namespace referenced_schema
      on referenced_schema.oid = referenced_table.relnamespace
    where constraint_record.conrelid = 'public.profiles'::regclass
      and constraint_record.contype = 'f'
      and constraint_record.confdeltype = 'c'
      and referenced_schema.nspname = 'auth'
      and referenced_table.relname = 'users'
      and exists (
        select 1
        from unnest(constraint_record.conkey) local_key(attnum)
        join pg_catalog.pg_attribute local_column
          on local_column.attrelid = constraint_record.conrelid
          and local_column.attnum = local_key.attnum
        where local_column.attname = 'id'
      )
  ) then
    raise exception 'profiles.id must cascade when auth.users is deleted';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.user_items'::regclass
      and constraint_record.confrelid = 'public.profiles'::regclass
      and constraint_record.contype = 'f'
      and constraint_record.confdeltype = 'c'
      and exists (
        select 1
        from unnest(constraint_record.conkey) local_key(attnum)
        join pg_catalog.pg_attribute local_column
          on local_column.attrelid = constraint_record.conrelid
          and local_column.attnum = local_key.attnum
        where local_column.attname = 'user_id'
      )
  ) then
    raise exception 'user_items.user_id must cascade when profiles is deleted';
  end if;
end;
$$;

alter table public.items
  alter column created_by drop not null;
alter table public.user_items
  alter column assigned_by drop not null;

-- Constraint names can differ across environments, so discover and remove
-- every FK that currently governs each column before adding the final rule.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select constraint_definition.conname
    from pg_catalog.pg_constraint constraint_definition
    where constraint_definition.conrelid = 'public.items'::regclass
      and constraint_definition.contype = 'f'
      and exists (
        select 1
        from unnest(constraint_definition.conkey) local_key(attnum)
        join pg_catalog.pg_attribute local_column
          on local_column.attrelid = constraint_definition.conrelid
          and local_column.attnum = local_key.attnum
        where local_column.attname = 'created_by'
      )
  loop
    execute format(
      'alter table public.items drop constraint %I',
      constraint_record.conname
    );
  end loop;

  for constraint_record in
    select constraint_definition.conname
    from pg_catalog.pg_constraint constraint_definition
    where constraint_definition.conrelid = 'public.user_items'::regclass
      and constraint_definition.contype = 'f'
      and exists (
        select 1
        from unnest(constraint_definition.conkey) local_key(attnum)
        join pg_catalog.pg_attribute local_column
          on local_column.attrelid = constraint_definition.conrelid
          and local_column.attnum = local_key.attnum
        where local_column.attname = 'assigned_by'
      )
  loop
    execute format(
      'alter table public.user_items drop constraint %I',
      constraint_record.conname
    );
  end loop;
end;
$$;

-- Only the nullable actor column is cleared. tenant_id remains intact and the
-- composite FK continues to make cross-tenant references impossible.
alter table public.items
  add constraint items_created_by_fkey
  foreign key (tenant_id, created_by)
  references public.profiles(tenant_id, id)
  on delete set null (created_by);

alter table public.user_items
  add constraint user_items_assigned_by_fkey
  foreign key (tenant_id, assigned_by)
  references public.profiles(tenant_id, id)
  on delete set null (assigned_by);

comment on column public.items.created_by is
  'Creator profile when it still exists; retained items use NULL after user deletion.';
comment on column public.user_items.assigned_by is
  'Assigning profile when it still exists; retained assignments use NULL after user deletion.';
