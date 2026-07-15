-- Incremental migration: persist the normalized profile name for admin user creation.
alter table public.profiles add column if not exists normalized_name text;

update public.profiles
set normalized_name = lower(regexp_replace(trim(full_name), '[[:space:]]+', ' ', 'g'))
where normalized_name is null;

alter table public.profiles alter column normalized_name set not null;
create unique index if not exists profiles_normalized_name_key on public.profiles (normalized_name);

create or replace function public.prepare_profile()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.full_name := regexp_replace(trim(new.full_name), '[[:space:]]+', ' ', 'g');
  new.normalized_name := lower(new.full_name);
  return new;
end;
$$;

drop trigger if exists prepare_profile_before_write on public.profiles;
create trigger prepare_profile_before_write before insert or update of full_name on public.profiles
for each row execute function public.prepare_profile();
