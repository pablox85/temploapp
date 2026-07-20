"use client";

import { useState } from "react";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { CreateItemForm } from "@/components/create-item-form";
import { ModalShell } from "@/components/modal-shell";

export function CreateItemModalTrigger({ className = "button-primary", label = "Agregar ítem", onOpen }: { className?: string; label?: string; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => {
        onOpen?.();
        setOpen(true);
      }}>
        <PlusIcon className="size-4" />{label}
      </button>
      <ModalShell open={open} onClose={() => setOpen(false)} labelledBy="create-item-title" maxWidthClass="max-w-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">NUEVO ÍTEM</p>
            <h2 id="create-item-title" className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Agregar ítem</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Suma una opción a la lista colaborativa.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Cerrar agregar ítem">
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="mt-6"><CreateItemForm compact onSuccess={() => setOpen(false)} /></div>
      </ModalShell>
    </>
  );
}
