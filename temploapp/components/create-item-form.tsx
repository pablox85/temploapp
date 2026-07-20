"use client";

import { useActionState, useEffect, useRef } from "react";
import { createItemAction } from "@/app/(dashboard)/dashboard/items/actions";
import { ActionMessage } from "@/components/action-message";
import { PlusIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function CreateItemForm({ compact = false, onSuccess }: { compact?: boolean; onSuccess?: () => void }) {
  const [state, action] = useActionState(createItemAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.status === "success") { formRef.current?.reset(); onSuccess?.(); } }, [onSuccess, state]);

  return (
    <form ref={formRef} action={action} className={compact ? "space-y-3" : "space-y-5"}>
      <div>
        <label htmlFor={compact ? "quick-name" : "name"} className="label">Nombre del ítem</label>
        <input id={compact ? "quick-name" : "name"} name="name" required maxLength={160} className="input" placeholder="Ej. Auto" />
        {!compact && <p className="mt-2 text-sm text-slate-500">No importa si usas mayúsculas o espacios extra: evitaremos duplicados automáticamente.</p>}
      </div>
      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Agregando…" className={compact ? "button-primary w-full" : "button-primary"}>
        <PlusIcon className="size-4" />Agregar ítem
      </SubmitButton>
    </form>
  );
}
