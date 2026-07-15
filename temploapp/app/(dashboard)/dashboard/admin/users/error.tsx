"use client";

export default function AdminUsersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center rounded-3xl bg-slate-950 p-8 text-center"><div><p className="text-sm font-semibold text-rose-300">ALGO SALIÓ MAL</p><h1 className="mt-2 text-2xl font-bold text-white">No pudimos cargar los usuarios</h1><p className="mt-2 text-slate-400">Comprueba la conexión e inténtalo otra vez.</p><button onClick={reset} className="button-primary mt-6">Reintentar</button></div></div>;
}
