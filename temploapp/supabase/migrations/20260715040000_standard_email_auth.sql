-- Remove profile-name identity artifacts. Authentication now uses Supabase email/password directly.
drop trigger if exists prepare_profile_before_write on public.profiles;
drop function if exists public.prepare_profile();
drop index if exists public.profiles_normalized_name_key;
drop index if exists public.profiles_normalized_full_name_key;
alter table public.profiles drop column if exists normalized_name;
