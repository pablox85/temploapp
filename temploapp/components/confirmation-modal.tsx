"use client";

import { useEffect, useId } from "react";

export function ConfirmationModal({ open, message, onCancel, onConfirm, confirmClassName = "button-primary", confirmLabel = "Confirmar" }: {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmClassName?: string;
  confirmLabel?: string;
}) {
  const titleId = useId();
  const messageId = useId();
  const isDanger = confirmClassName.split(/\s+/).includes("button-danger");
  const confirmButtonClass = isDanger
    ? "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-500 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md focus-visible:ring-4 focus-visible:ring-rose-500/25 focus-visible:outline-none active:translate-y-0 active:scale-[.98] sm:w-auto"
    : "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-900/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md focus-visible:ring-4 focus-visible:ring-teal-500/20 focus-visible:outline-none active:translate-y-0 active:scale-[.98] sm:w-auto";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel} aria-label="Cancelar" />
      <section className="page-transition relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId}>
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">CONFIRMAR ACCIÓN</p>
        <h2 id={titleId} className="mt-2 text-xl font-bold text-slate-950 dark:text-white">¿Deseas continuar?</h2>
        <p id={messageId} className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="button-secondary w-full sm:w-auto" onClick={onCancel}>Cancelar</button>
          <button type="button" className={confirmButtonClass} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
