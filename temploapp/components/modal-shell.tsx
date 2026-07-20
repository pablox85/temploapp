"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function ModalShell({
  open,
  onClose,
  labelledBy,
  describedBy,
  maxWidthClass = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex h-dvh max-h-dvh overflow-y-auto overscroll-contain p-4 sm:p-6" role="presentation">
      <button type="button" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar modal" />
      <section
        ref={panelRef}
        tabIndex={-1}
        className={`page-transition relative z-10 m-auto max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl focus:outline-none sm:max-h-[calc(100dvh-3rem)] sm:p-6 dark:border-slate-700 dark:bg-slate-900 ${maxWidthClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}
