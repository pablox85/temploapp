import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListIcon } from "@/components/icons";
import { ExtraChecklist } from "@/components/extra-checklist";
import { ExtraInventoryList } from "@/components/extra-inventory-list";
import { ExtraNotesList } from "@/components/extra-notes-list";
import { requireAdmin } from "@/lib/auth";
import { EXTRA_LIST_TYPE_BADGE_CLASSES, getExtraListTypeLabel } from "@/lib/extra-lists";
import { getExtraListByName, getExtraListEntries } from "@/lib/services/extra-lists";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listName: string }>;
}): Promise<Metadata> {
  const { listName } = await params;
  const list = listName ? await getExtraListByName(listName) : null;

  return {
    title: list ? `${getExtraListTypeLabel(list.list_type)} · ${list.name}` : "Lista extra",
  };
}

export default async function ExtraListPage({
  params,
}: {
  params: Promise<{ listName: string }>;
}) {
  await requireAdmin();
  const { listName } = await params;
  if (!listName || listName.length > 120) notFound();

  const list = await getExtraListByName(listName);
  if (!list) notFound();
  const entries = await getExtraListEntries(list.id);

  const listContent = list.list_type === "inventory"
    ? <ExtraInventoryList listId={list.id} listName={list.name} entries={entries.inventory} />
    : list.list_type === "checklist"
      ? <ExtraChecklist listId={list.id} listName={list.name} entries={entries.checklist} />
      : list.list_type === "notes"
        ? <ExtraNotesList listId={list.id} listName={list.name} entries={entries.notes} />
        : (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <ListIcon className="size-7" />
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white">Esta lista todavía está vacía</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aquí aparecerá el contenido de “{list.name}”.</p>
            </div>
          </div>
        );

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/extras"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300"
      >
        <span aria-hidden="true">←</span> Volver a Extras
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-teal-600">LISTA EXTRA</p>
          <h1 className="mt-1 truncate text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{list.name}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Creada el {new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(list.created_at))}
          </p>
        </div>
        <span className={`badge w-fit shrink-0 ${EXTRA_LIST_TYPE_BADGE_CLASSES[list.list_type]}`}>
          {getExtraListTypeLabel(list.list_type)}
        </span>
      </header>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/3 dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contenido</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Elementos guardados en esta lista.</p>
        </div>
        {listContent}
      </section>
    </div>
  );
}
