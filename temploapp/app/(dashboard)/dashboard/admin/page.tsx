import { AdminUserCard } from "@/components/admin-user-card";
import { ShieldIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getAdminData } from "@/lib/services/admin";

export default async function AdminPage() {
  await requireAdmin();
  const { profiles, items, assignments } = await getAdminData();
  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-teal-400"><ShieldIcon className="size-6" /></span><div><p className="text-sm font-semibold text-teal-600">ADMINISTRACIÓN</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Panel admin</h1><p className="mt-2 text-slate-500">Gestiona los usuarios y sus asignaciones.</p></div></header>

      <section className="mt-9">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">Usuarios y asignaciones</h2>
          <p className="mt-1 text-sm text-slate-500">Asigna un ítem disponible u ocupado; cada persona puede tener varios.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {profiles.map((profile) => <AdminUserCard key={profile.id} profile={profile} profiles={profiles} items={items} assignments={assignments} />)}
        </div>
      </section>
    </div>
  );
}
