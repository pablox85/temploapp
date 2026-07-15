import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { CheckIcon, ShieldIcon, UsersIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(20,184,166,.22),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(139,92,246,.16),transparent_35%)]" />
        <div className="relative"><Brand inverse /></div>
        <div className="relative max-w-xl">
          <span className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-teal-300">Un espacio compartido, siempre al día</span>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">Organicemos juntos.<br /><span className="text-teal-400">Sin perder el control.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">TemploAPP un lugar donde organizar las listas de compras.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[{ icon: UsersIcon, text: "Colaborativo" }, { icon: CheckIcon, text: "Sin duplicados" }, { icon: ShieldIcon, text: "Seguro" }].map(({ icon: Icon, text }) => (
              <div key={text} className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon className="mb-3 size-5 text-teal-400" /><p className="text-sm font-medium">{text}</p></div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">TemploAPP · por Bpr Soluciones</p>
      </section>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden border-slate-800 bg-slate-900 p-6 text-white lg:border-l sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(20,184,166,.12),transparent_32%),radial-gradient(circle_at_15%_90%,rgba(139,92,246,.12),transparent_35%)]" />
        <div className="relative w-full max-w-md">
          <div className="mb-10 lg:hidden"><Brand inverse /></div>
          <p className="text-sm font-semibold text-teal-400">BIENVENIDO</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-50">Inicia sesión</h2>
          <p className="mt-3 text-slate-400">Ingresa tu email y contraseña para continuar.</p>
          {params.error === "profile" && <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">Tu cuenta no tiene un perfil asociado. Contacta a un administrador.</p>}
          <div className="mt-8 rounded-2xl border border-slate-700/80 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <LoginForm redirectTo={params.redirectTo ?? "/dashboard"} />
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">Las cuentas son gestionadas por el administrador del espacio.</p>
        </div>
      </section>
    </main>
  );
}
