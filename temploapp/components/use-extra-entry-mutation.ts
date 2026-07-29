"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { initialActionState, type ActionState } from "@/lib/action-state";

export function useExtraEntryMutation() {
  const router = useRouter();
  const [state, setState] = useState<ActionState>(initialActionState);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(key: string, mutation: () => Promise<ActionState>) {
    if (isPending) return;
    setPendingKey(key);
    startTransition(async () => {
      try {
        const result = await mutation();
        setState(result);
        if (result.status === "success") router.refresh();
      } catch {
        setState({ status: "error", message: "No se pudo completar la acción." });
      } finally {
        setPendingKey(null);
      }
    });
  }

  return { state, pendingKey, isPending, run };
}
