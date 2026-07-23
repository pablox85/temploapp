import { ItemList } from "@/components/item-list";
import { CreateItemModalTrigger } from "@/components/create-item-modal";
import { requireProfile } from "@/lib/auth";
import { getItems } from "@/lib/services/items";

type ItemFilter = "available" | "selected";

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const params = await searchParams;
  const profile = await requireProfile();
  const items = await getItems(profile.id, profile.role === "admin");
  const filter: ItemFilter | null = params.filter === "available" || params.filter === "selected" ? params.filter : null;
  const heading = filter === "available" ? "Ítems disponibles" : filter === "selected" ? "Ítems seleccionados" : "Todos los ítems";
  const description = filter === "available"
    ? "Estos ítems todavía no fueron seleccionados."
    : filter === "selected"
      ? "Estos ítems ya fueron seleccionados por usuarios del templo."
      : "Selecciona un ítem disponible para tu lista.";

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-teal-600">LISTA COLABORATIVA</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{heading}</h1><p className="mt-2 text-slate-500">{description}</p></div>
        <CreateItemModalTrigger />
      </header>
      <ItemList key={filter ?? "all"} items={items} isAdmin={profile.role === "admin"} initialAssignmentFilter={filter ?? "all"} />
    </div>
  );
}
