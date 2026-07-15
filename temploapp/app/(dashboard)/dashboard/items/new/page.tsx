import Link from "next/link";
import { CreateItemForm } from "@/components/create-item-form";
import { SparklesIcon } from "@/components/icons";

export default function NewItemPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/items" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Volver a la lista</Link>
      <header className="mt-6"><p className="text-sm font-semibold text-teal-600">NUEVO ÍTEM</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Agrega algo a la lista</h1><p className="mt-2 text-slate-500">Estará disponible de inmediato para todas las personas.</p></header>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] sm:p-8">
        <div className="mb-6 flex items-start gap-4 rounded-2xl bg-teal-50 p-4 text-teal-900"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-teal-600"><SparklesIcon className="size-5" /></span><div><p className="font-semibold">Nos ocupamos de la limpieza</p><p className="mt-1 text-sm leading-5 text-teal-700">“Auto”, “ auto ” y “AUTO” se reconocen como el mismo ítem.</p></div></div>
        <CreateItemForm />
      </section>
    </div>
  );
}
