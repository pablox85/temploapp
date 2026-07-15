"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center text-center"><div><p className="text-sm font-semibold text-rose-600">ALGO SALIÓ MAL</p><h1 className="mt-2 text-2xl font-bold text-slate-950">No pudimos cargar esta vista</h1><p className="mt-2 text-slate-500">Comprueba la conexión con Supabase e inténtalo otra vez.</p><button onClick={reset} className="button-primary mt-6">Reintentar</button></div></div>;
}
