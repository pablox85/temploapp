import type { ComponentType, SVGProps } from "react";

export function StatCard({ label, value, detail, icon: Icon, tone = "teal" }: {
  label: string;
  value: number;
  detail: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: "teal" | "violet" | "amber";
}) {
  const tones = { teal: "bg-teal-50 text-teal-700", violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700" };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p></div>
        <span className={`grid size-11 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
