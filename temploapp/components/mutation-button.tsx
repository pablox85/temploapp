"use client";

import { useState, useTransition } from "react";
import type { ActionState } from "@/lib/action-state";

export function MutationButton({ action, children, pendingLabel = "Guardando…", className = "button-secondary", confirmMessage, disabled = false }: {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  confirmMessage?: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending || disabled}
        className={className}
        onClick={() => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          setError("");
          startTransition(async () => {
            const result = await action();
            if (result.status === "error") setError(result.message);
          });
        }}
      >
        {pending ? pendingLabel : children}
      </button>
      {error && <span className="max-w-48 text-right text-xs text-rose-600">{error}</span>}
    </span>
  );
}
