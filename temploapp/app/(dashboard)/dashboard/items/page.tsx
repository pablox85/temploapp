import Link from "next/link";
import { ItemList } from "@/components/item-list";
import { PlusIcon } from "@/components/icons";
import { requireProfile } from "@/lib/auth";
import { getItems } from "@/lib/services/items";

export default async function ItemsPage() {
  const profile = await requireProfile();
  const items = await getItems(profile.id);
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-teal-600">LISTA COLABORATIVA</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Todos los ítems</h1><p className="mt-2 text-slate-500">Selecciona un ítem disponible para tu lista.</p></div>
        <Link href="/dashboard/items/new" className="button-primary"><PlusIcon className="size-4" />Agregar ítem</Link>
      </header>
      <ItemList items={items} />
    </div>
  );
}
