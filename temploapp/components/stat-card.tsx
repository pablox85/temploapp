import type { ComponentType, SVGProps } from "react";
import Link from "next/link";

export function StatCard({ label, value, detail, icon: Icon, tone = "teal", href }: {
  label: string;
  value: number;
  detail: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: "teal" | "violet" | "amber" | "blue";
  href?: string;
}) {
  const tones = { teal: "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300", violet: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300", amber: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300", blue: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300" };
  const content = (
    <div className="motion-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] hover:border-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p></div>
        <span className={`grid size-11 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
  return href ? <Link href={href} aria-label={`${label}: ${value}`} className="block">{content}</Link> : content;
}
