import { ListIcon } from "@/components/icons";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><ListIcon className="size-6" /></span>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
