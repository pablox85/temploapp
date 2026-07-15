"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActionError, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { idSchema, itemNameSchema } from "@/lib/validation";

function refreshAll() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/my-items");
  revalidatePath("/dashboard/admin");
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

export async function assignItemAction(userId: string, itemId: string): Promise<ActionState> {
  const admin = await requireAdmin();
  const user = idSchema.safeParse(userId);
  const item = idSchema.safeParse(itemId);
  if (!user.success || !item.success) return { status: "error", message: "Asignación inválida." };

  const supabase = await createClient();
  const { error } = await supabase.from("user_items").insert({
    user_id: user.data,
    item_id: item.data,
    assigned_by: admin.id,
  });
  if (error) {
    if (error.code === "23505") return { status: "success", message: "Ya estaba asignado." };
    return { status: "error", message: getActionError(error) };
  }
  refreshAll();
  return { status: "success", message: "Asignación agregada." };
}

export async function removeAssignmentAction(userId: string, itemId: string): Promise<ActionState> {
  await requireAdmin();
  const user = idSchema.safeParse(userId);
  const item = idSchema.safeParse(itemId);
  if (!user.success || !item.success) return { status: "error", message: "Asignación inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_items")
    .delete()
    .eq("user_id", user.data)
    .eq("item_id", item.data);
  if (error) return { status: "error", message: getActionError(error) };
  refreshAll();
  return { status: "success", message: "Asignación quitada." };
}
