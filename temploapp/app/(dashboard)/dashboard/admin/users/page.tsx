import { CreateUserForm } from "@/components/create-user-form";
import { DeleteUserButton } from "@/components/delete-user-button";
import { ShieldIcon } from "@/components/icons";
import { UserRoleControl } from "@/components/user-role-control";
import { requireAdmin } from "@/lib/auth";
import { listAdminProfiles } from "@/lib/services/admin";

const dateFormatter = new Intl.DateTimeFormat("es-UY", { dateStyle: "medium" });

export default async function AdminUsersPage() {
  const actorProfile = await requireAdmin();
  const profiles = await listAdminProfiles();

  return <div className="mx-auto max-w-7xl rounded-3xl bg-white p-5 text-slate-900 shadow-xl shadow-slate-900/5 sm:p-8 xl:p-10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-2xl dark:shadow-black/20">
    <header className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"><ShieldIcon className="size-6" /></span><div><p className="text-sm font-semibold text-teal-600 dark:text-teal-300">ADMINISTRACIÓN</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Usuarios</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Crea accesos y consulta las personas registradas.</p></div></header>

    <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Crear usuario</h2><p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">El acceso se realizará con el email y la contraseña indicados.</p><CreateUserForm /></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70"><div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Usuarios registrados</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profiles.length} {profiles.length === 1 ? "usuario" : "usuarios"}</p></div>{profiles.length === 0 ? <div className="p-10 text-center"><p className="font-medium text-slate-700 dark:text-slate-200">Aún no hay usuarios</p><p className="mt-2 text-sm text-slate-500">Crea el primer acceso desde este formulario.</p></div> : <div className="divide-y divide-slate-200 dark:divide-slate-800">{profiles.map((profile) => <article key={profile.id} className="px-6 py-4"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="truncate font-semibold text-slate-900 dark:text-slate-100">{profile.full_name}</p><div className="mt-1 flex items-center gap-3 text-sm text-slate-500"><span>Creado el {dateFormatter.format(new Date(profile.created_at))}</span><span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300"><i className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />Activo</span></div></div><span className={`badge ${profile.role === "admin" ? "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{profile.role === "admin" ? "Administrador" : "Usuario"}</span></div><div className="flex flex-wrap items-start gap-x-3"><UserRoleControl profileId={profile.id} role={profile.role} />{profile.id !== actorProfile.id && <DeleteUserButton userId={profile.id} userName={profile.full_name} />}</div></article>)}</div>}</section>
    </div>
  </div>;
}
