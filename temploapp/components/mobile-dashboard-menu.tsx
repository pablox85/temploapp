"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { DashboardNav, DashboardQuickLinks } from "@/components/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileDashboardMenu({ isAdmin, fullName, children }: { isAdmin: boolean; fullName: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <>
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:hidden">
      <Brand responsive />
      <div className="flex min-w-0 items-start gap-1">
        <DashboardQuickLinks isAdmin={isAdmin} />
        <div className="flex flex-col items-center gap-0.5">
          <ThemeToggle />
          <span className="text-[9px] font-medium leading-3 text-slate-500 dark:text-slate-400">Tema</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Abrir menú" aria-expanded={open}>
            <MenuIcon className="size-5" />
          </button>
          <span className="text-[9px] font-medium leading-3 text-slate-500 dark:text-slate-400">Menú</span>
        </div>
      </div>
    </header>
    {open && <div className="fixed inset-0 z-50 lg:hidden">
      <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="Cerrar menú" />
      <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900" role="dialog" aria-modal="true" aria-label="Menú principal">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Brand />
            <p className="mt-1 ml-[52px] truncate text-xs font-medium text-slate-500 dark:text-slate-400" title={fullName}>{fullName}</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Cerrar menú"><CloseIcon className="size-5" /></button>
        </div>
        <div className="mt-8"><DashboardNav isAdmin={isAdmin} mobile onNavigate={() => setOpen(false)} /></div>
        <div className="mt-auto border-t border-slate-100 pt-5 dark:border-slate-800">{children}</div>
      </aside>
    </div>}
  </>;
}
