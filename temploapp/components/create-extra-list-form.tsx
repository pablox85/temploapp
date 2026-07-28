"use client";

import { useActionState, useEffect, useRef } from "react";
import { createExtraListAction } from "@/app/(dashboard)/dashboard/extras/actions";
import { ActionMessage } from "@/components/action-message";
import { PlusIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";
import { EXTRA_LIST_TYPES } from "@/lib/extra-lists";

export function CreateExtraListForm() {
  const [state, action] = useActionState(createExtraListAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div>
        <label htmlFor="extra-list-name" className="label">Nombre de la lista</label>
        <input
          id="extra-list-name"
          name="name"
          required
          maxLength={120}
          className="input"
          placeholder="Ej. Tareas del evento"
        />
      </div>

      <div>
        <label htmlFor="extra-list-type" className="label">Tipo de lista</label>
        <select id="extra-list-type" name="type" required defaultValue="checklist" className="input">
          {EXTRA_LIST_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Creando…" className="button-primary w-full">
        <PlusIcon className="size-4" />Crear lista
      </SubmitButton>
    </form>
  );
}
