import Link from "next/link";
import { TempleIcon } from "@/components/icons";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-3" aria-label="TemploAPP, inicio">
      <span className="grid size-10 place-items-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-900/20">
        <TempleIcon className="size-6" />
      </span>
      {!compact && <span className={`text-lg font-bold tracking-tight ${inverse ? "text-white" : "text-slate-900"}`}>Templo<span className="text-teal-500">APP</span></span>}
    </Link>
  );
}
