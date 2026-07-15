import { AdminItemEditor } from "@/components/admin-item-editor";
import { AdminUserCard } from "@/components/admin-user-card";
import { CreateItemForm } from "@/components/create-item-form";
import { ShieldIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getAdminData } from "@/lib/services/admin";

export default async function AdminPage() {
  await requireAdmin();
  const { profiles, items, assignments } = await getAdminData();
  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-teal-400"><ShieldIcon className="size-6" /></span><div><p className="text-sm font-semibold text-teal-600">ADMINISTRACIÓN</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Panel admin</h1><p className="mt-2 text-slate-500">Gestiona la lista y las asignaciones de todos los usuarios.</p></div></header>

      <section className="mt-9 grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]"><h2 className="text-lg font-semibold text-slate-900">Crear ítem</h2><p className="mb-5 mt-1 text-sm text-slate-500">Agrega una opción a la lista global.</p><CreateItemForm compact /></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold text-slate-900">Administrar ítems</h2><p className="mt-1 text-sm text-slate-500">{items.length} ítems en total</p></div>{items.length ? items.map((item) => <AdminItemEditor key={item.id} item={item} />) : <p className="p-8 text-center text-sm text-slate-500">La lista está vacía.</p>}</div>
      </section>

      <section className="mt-10"><div className="mb-5"><h2 className="text-xl font-bold text-slate-950">Usuarios y asignaciones</h2><p className="mt-1 text-sm text-slate-500">Reasigna un ítem disponible u ocupado; cada persona solo puede tener uno.</p></div><div className="grid gap-4 xl:grid-cols-2">{profiles.map((profile) => <AdminUserCard key={profile.id} profile={profile} profiles={profiles} items={items} assignments={assignments} />)}</div></section>
    </div>
  );
}
