import type { ActionState } from "@/lib/action-state";

export function ActionMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  return (
    <p role="status" className={`rounded-xl px-3 py-2 text-sm ${state.status === "error" ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200" : "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200"}`}>
      {state.message}
    </p>
  );
}
