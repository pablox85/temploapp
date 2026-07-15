
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActionError, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { idSchema, itemAssignmentSchema, itemNameSchema } from "@/lib/validation";

function refreshAll() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/my-items");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
}

export async function updateItemAction(
  itemId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(itemId);
  const name = itemNameSchema.safeParse(formData.get("name"));
  if (!id.success) return { status: "error", message: id.error.issues[0].message };
  if (!name.success) return { status: "error", message: name.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ name: name.data }).eq("id", id.data);
  if (error) return { status: "error", message: getActionError(error) };
  refreshAll();
  return { status: "success", message: "Ítem actualizado." };
}

export async function deleteItemAction(itemId: string): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(itemId);
  if (!id.success) return { status: "error", message: id.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id.data);
  if (error) return { status: "error", message: getActionError(error) };
  refreshAll();
  return { status: "success", message: "Ítem eliminado." };
}

export async function reassignItemAction(userId: string, itemId: string): Promise<ActionState> {
  await requireAdmin();
  const parsed = itemAssignmentSchema.safeParse({ userId, itemId });
  if (!parsed.success) return { status: "error", message: "Asignación inválida." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reassign_item", {
    target_user_id: parsed.data.userId,
    target_item_id: parsed.data.itemId,
  });
  if (error) {
    if (error.code === "P0001") return { status: "error", message: "El usuario destino ya tiene un ítem seleccionado." };
    if (error.code === "P0003") return { status: "error", message: "El ítem seleccionado no existe." };
    if (error.code === "P0004") return { status: "error", message: "El usuario destino no existe." };
    if (error.code === "42501") return { status: "error", message: "No tienes permisos para reasignar ítems." };
    return { status: "error", message: getActionError(error) };
  }
  refreshAll();
  return { status: "success", message: data?.[0]?.changed ? "Ítem reasignado." : "El ítem ya pertenece a este usuario." };
}

export async function removeAssignmentAction(userId: string, itemId: string): Promise<ActionState> {
  await requireAdmin();
  const parsed = itemAssignmentSchema.safeParse({ userId, itemId });
  if (!parsed.success) return { status: "error", message: "Asignación inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_items")
    .delete()
    .eq("user_id", parsed.data.userId)
    .eq("item_id", parsed.data.itemId);
  if (error) return { status: "error", message: getActionError(error) };
  refreshAll();
  return { status: "success", message: "Asignación quitada." };
}