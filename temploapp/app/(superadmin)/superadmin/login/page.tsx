import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ShieldIcon } from "@/components/icons";
import { Brand } from "@/components/brand";
import { SuperAdminLoginForm } from "@/components/superadmin-login-form";
import { isCurrentUserSuperAdmin } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Acceso SuperAdmin",
};

export default async function SuperAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isCurrentUserSuperAdmin()) redirect("/superadmin/tenants/new");
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <header className="flex items-center justify-between gap-4">
          <Brand inverse />
          <Link href="/login" className="button-secondary border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white">
            <ArrowLeftIcon className="size-4" />
            Login Usuario
          </Link>
        </header>

        <section className="page-transition my-auto py-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="mb-7 border-b border-slate-800 pb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                <ShieldIcon className="size-4" />
                Administración global
              </span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white">Acceso SuperAdmin</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">Ingresa para administrar templos y sus espacios de trabajo.</p>
            </div>

            <p className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-200">
              Acceso exclusivo para administración global.
            </p>

            {error === "forbidden" && <p className="mb-5 rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm text-rose-200">Tu sesión no tiene permisos de SuperAdmin.</p>}
            {error === "validation" && <p className="mb-5 rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm text-rose-200">No se pudo comprobar la autorización. Inténtalo nuevamente.</p>}

            <SuperAdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
