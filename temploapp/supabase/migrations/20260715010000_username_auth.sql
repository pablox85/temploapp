-- TemploAPP identifies users by a unique name in the UI.
-- Auth still uses an opaque, deterministic technical email internally.

create unique index if not exists profiles_normalized_full_name_key
on public.profiles ((lower(regexp_replace(trim(full_name), '[[:space:]]+', ' ', 'g'))));

create or replace function public.prepare_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.full_name := regexp_replace(trim(new.full_name), '[[:space:]]+', ' ', 'g');
  return new;
end;
$$;

drop trigger if exists prepare_profile_before_write on public.profiles;
create trigger prepare_profile_before_write
before insert or update of full_name on public.profiles
for each row execute function public.prepare_profile();
