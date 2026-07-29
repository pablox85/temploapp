-- Admin-only deletion for auxiliary lists in the current tenant.
drop policy if exists "extra_lists_admin_delete" on public.extra_lists;

create policy "extra_lists_admin_delete"
on public.extra_lists for delete to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select public.is_admin())
);

grant delete on table public.extra_lists to authenticated;

notify pgrst, 'reload schema';
