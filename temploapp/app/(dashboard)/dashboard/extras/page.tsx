import { CreateExtraListForm } from "@/components/create-extra-list-form";
import { DeleteExtraListButton } from "@/components/delete-extra-list-button";
import { SparklesIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { EXTRA_LIST_TYPE_BADGE_CLASSES, getExtraListTypeLabel } from "@/lib/extra-lists";
import { getExtraLists } from "@/lib/services/extra-lists";

export default async function ExtrasPage() {
  await requireAdmin();
  const lists = await getExtraLists();

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-sm font-semibold text-teal-600">FUNCIONES ADICIONALES</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Extras</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Un espacio para futuras herramientas de TemploAPP.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Listas creadas</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lists.length} {lists.length === 1 ? "lista" : "listas"}</p>
          </div>

          {lists.length === 0 ? (
            <div className="motion-card grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <div>
                <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">
                  <SparklesIcon className="size-7" />
                </span>
                <h3 className="font-semibold text-slate-900 dark:text-white">Todavía no hay listas extra</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Crea la primera con el formulario.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lists.map((list) => (
                <article key={list.id} className="motion-card group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/3 hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700">
                  <a
                    href={`/dashboard/extras/${encodeURIComponent(list.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    aria-label={`Abrir lista ${list.name} en una nueva pestaña`}
                  >
                    <span className="sr-only">Abrir {list.name}</span>
                  </a>
                  <div className="pointer-events-none relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{list.name}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Creada el {new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(list.created_at))}
                      </p>
                    </div>
                    <span className={`badge shrink-0 ${EXTRA_LIST_TYPE_BADGE_CLASSES[list.list_type]}`}>
                      {getExtraListTypeLabel(list.list_type)}
                    </span>
                  </div>
                  <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <a
                      href={`/dashboard/extras/${encodeURIComponent(list.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-teal-600 transition hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                      aria-label={`Abrir lista ${list.name} en una nueva pestaña`}
                    >
                      Abrir lista <span aria-hidden="true">↗</span>
                    </a>
                    <DeleteExtraListButton listId={list.id} listName={list.name} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Nueva lista</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">Elige un nombre y el tipo de lista.</p>
          <CreateExtraListForm />
        </aside>
      </div>
    </div>
  );
}
