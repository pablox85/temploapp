export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialActionState: ActionState = { status: "idle", message: "" };

export function getActionError(error: { code?: string; message: string }) {
  if (error.code === "23505") return "Ese ítem ya existe.";
  if (error.code === "23503") return "El registro relacionado ya no existe.";
  if (error.code === "42501") return "No tienes permisos para realizar esta acción.";
  return "No se pudo completar la acción. Inténtalo nuevamente.";
}
