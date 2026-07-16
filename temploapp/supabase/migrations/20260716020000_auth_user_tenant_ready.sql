-- Supabase Admin inserts auth.users before applying the requested app_metadata.
-- Wait until tenant_id is present so handle_new_user() can create the profile
-- in the correct tenant without weakening its fail-closed validation.
--
-- Supabase projects do not allow the postgres role to drop triggers directly
-- from auth.users because that relation belongs to supabase_auth_admin. Dropping
-- the postgres-owned trigger function with CASCADE removes only its dependent
-- triggers, after which the function and corrected triggers can be recreated.
drop function if exists public.handle_new_user() cascade;

create function public.handle_new_user()
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

-- Keep compatibility with Auth flows that provide tenant_id on the initial row.
create trigger on_auth_user_created
after insert on auth.users
for each row
when ((new.raw_app_meta_data ->> 'tenant_id') is not null)
execute function public.handle_new_user();

-- admin.createUser() reaches this trigger after GoTrue applies app_metadata.
create trigger on_auth_user_tenant_ready
after update of raw_app_meta_data on auth.users
for each row
when (
  (new.raw_app_meta_data ->> 'tenant_id') is not null
  and (old.raw_app_meta_data ->> 'tenant_id') is distinct from
      (new.raw_app_meta_data ->> 'tenant_id')
)
execute function public.handle_new_user();
