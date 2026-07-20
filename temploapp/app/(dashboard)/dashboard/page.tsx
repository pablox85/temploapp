import Link from "next/link";
import { CreateItemForm } from "@/components/create-item-form";
import { CheckIcon, ListIcon, PlusIcon, UsersIcon } from "@/components/icons";
import { StatCard } from "@/components/stat-card";
import { requireProfile } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/items";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const stats = await getDashboardStats(profile.id);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-teal-600">PANEL GENERAL</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Hola, {firstName}</h1><p className="mt-2 text-slate-500">Este es el estado actual de la lista compartida.</p></div>
        <Link href="/dashboard/items/new" className="button-primary"><PlusIcon className="size-4" />Nuevo ítem</Link>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/dashboard/items" label="Ítems disponibles" value={stats.items} detail="En la lista colaborativa" icon={ListIcon} />
        <StatCard href="/dashboard/my-items" label="Mi selección" value={stats.mine} detail="Ítems seleccionados por ti" icon={CheckIcon} tone="violet" />
        <StatCard href="/dashboard/items" label="Selecciones totales" value={stats.assignments} detail="Entre todos los usuarios" icon={UsersIcon} tone="amber" />
        <StatCard href={profile.role === "admin" ? "/dashboard/admin/users" : undefined} label="Usuarios" value={stats.users} detail="Miembros del tenant actual" icon={UsersIcon} tone="blue" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="overflow-hidden rounded-2xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-9">
          <p className="text-sm font-semibold text-teal-400">EMPIEZA A COLABORAR</p>
          <h2 className="mt-2 max-w-md text-2xl font-bold">Explora la lista y elige el ítem que necesitas.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">Tu selección se actualiza de inmediato y puedes liberarla cuando quieras.</p>
          <Link href="/dashboard/items" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300">Ver lista completa <span aria-hidden="true">→</span></Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/]">
          <h2 className="font-semibold text-slate-900">Agregar rápidamente</h2><p className="mb-5 mt-1 text-sm text-slate-500">Suma una nueva opción a la lista.</p>
          <CreateItemForm compact />
        </div>
      </section>
    </div>
  );
}
