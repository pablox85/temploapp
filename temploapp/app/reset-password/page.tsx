import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-white sm:p-8">
      <section className="page-transition w-full max-w-md">
        <div className="mb-10"><Brand inverse /></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <p className="text-sm font-semibold text-teal-400">RECUPERACIÓN DE ACCESO</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50">Define una nueva contraseña</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Elige una contraseña de al menos seis caracteres para volver a ingresar a TemploAPP.</p>
          <div className="mt-7"><ResetPasswordForm /></div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500"><Link href="/login" className="transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60">Volver al inicio de sesión</Link></p>
      </section>
    </main>
  );
}
