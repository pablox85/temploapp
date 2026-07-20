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
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="button-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" className={confirmClassName} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
