"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActionError, type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { idSchema, itemNameSchema } from "@/lib/validation";

function refreshItemViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/my-items");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
}

export async function createItemAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = itemNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("items").insert({
    name: parsed.data,
    created_by: user.id,
  });

  if (error) return { status: "error", message: getActionError(error) };
  refreshItemViews();
  return { status: "success", message: `“${parsed.data}” fue agregado.` };
}

export async function selectItemAction(itemId: string): Promise<ActionState> {
  await requireUser();
  const parsedId = idSchema.safeParse(itemId);
  if (!parsedId.success) return { status: "error", message: parsedId.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.rpc("select_own_item", { target_item_id: parsedId.data });

  if (error) {
    if (error.code === "P0001") return { status: "error", message: "Ya tenés un ítem seleccionado." };
    if (error.code === "P0002") return { status: "error", message: "Este ítem ya fue seleccionado por otro usuario." };
    if (error.code === "P0003") return { status: "error", message: "El ítem seleccionado no existe." };
    if (error.code === "28000") return { status: "error", message: "Sesión expirada. Inicia sesión nuevamente." };
    return { status: "error", message: getActionError(error) };
  }
  refreshItemViews();
  return { status: "success", message: "Ítem seleccionado." };
}

export async function unselectItemAction(itemId: string): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(itemId);
  if (!parsedId.success) return { status: "error", message: parsedId.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_items")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", parsedId.data);

  if (error) return { status: "error", message: getActionError(error) };
  refreshItemViews();
  return { status: "success", message: "Selección quitada." };
}
