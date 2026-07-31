import type { Metadata } from "next";
import { ShieldIcon, LogOutIcon } from "@/components/icons";
import { Brand } from "@/components/brand";
import { SuperAdminTenantForm } from "@/components/superadmin-tenant-form";
import { superAdminSignOutAction } from "@/app/(superadmin)/superadmin/login/actions";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export const metadata: Metadata = {
  title: "Nuevo templo",
};

export default async function NewTenantPage() {
  await requireSuperAdmin();

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Brand inverse />
          <form action={superAdminSignOutAction}>
            <button type="submit" className="button-secondary border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white">
              <LogOutIcon className="size-4" />
              Salir
            </button>
          </form>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-12">
          <section className="page-transition lg:pt-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300">
              <ShieldIcon className="size-4" />
              SuperAdmin
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">Crear un nuevo templo</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-400">Configura el espacio de trabajo y deja listo el acceso de su administrador.</p>
            <p className="mt-8 max-w-md rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm leading-6 text-slate-400">EL administrador se crea con acceso confirmado y queda viculado a su lugar de trabajo.</p>
          </section>

          <section className="page-transition rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="mb-7 border-b border-slate-800 pb-5">
              <h2 className="text-xl font-semibold text-white">Datos del templo</h2>
              <p className="mt-1 text-sm text-slate-400">Completa los datos para continuar.</p>
            </div>
            <SuperAdminTenantForm />
          </section>
        </div>
      </div>
    </main>
  );
}
