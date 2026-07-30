"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActionError, type ActionState } from "@/lib/action-state";
import { requireProfile, requireUser } from "@/lib/auth";
import { collaborativeListTitleSchema, idSchema, itemNameSchema } from "@/lib/validation";

export type CollaborativeListTitleResult = {
  status: "success" | "error";
  message: string;
  title?: string | null;
};

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
  const { data, error } = await supabase
    .from("items")
    .insert({
      name: parsed.data,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: getActionError(error) };
  refreshItemViews();
  return { status: "success", message: `“${parsed.data}” fue agregado.`, itemId: data.id };
}

export async function markItemsNotificationsSeenAction(): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_items_notifications_seen");

  if (error) return { status: "error", message: getActionError(error) };
  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Notificaciones actualizadas." };
}

export async function updateCollaborativeListTitleAction(
  title: string,
): Promise<CollaborativeListTitleResult> {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    return { status: "error", message: "Solo un administrador puede cambiar el título." };
  }

  const parsed = collaborativeListTitleSchema.safeParse(title);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const nextTitle = parsed.data || null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .update({ items_list_title: nextTitle })
    .eq("id", profile.tenant_id)
    .select("items_list_title")
    .single();

  if (error) return { status: "error", message: getActionError(error) };

  revalidatePath("/dashboard", "layout");
  return {
    status: "success",
    message: nextTitle ? "Título guardado." : "Título restablecido.",
    title: data.items_list_title,
  };
}

export async function selectItemAction(itemId: string): Promise<ActionState> {
  await requireUser();
  const parsedId = idSchema.safeParse(itemId);
  if (!parsedId.success) return { status: "error", message: parsedId.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.rpc("select_own_item", { target_item_id: parsedId.data });

  if (error) {
    console.error("select_own_item error:", JSON.stringify(error, null, 2)); // TEMPORAL: quitar después
    if (error.code === "P0001") return { status: "error", message: "Ya tenés un ítem seleccionado." };
    if (error.code === "P0002") return { status: "error", message: "Este ítem ya fue seleccionado por otro usuario." };
    if (error.code === "P0003") return { status: "error", message: "El ítem seleccionado no existe." };
    if (error.code === "28000") return { status: "error", message: "Sesión expirada. Inicia sesión nuevamente." };
    // TEMPORAL: mostrar código y mensaje real en pantalla
    return { status: "error", message: `DEBUG [${error.code}]: ${error.message}` };
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

export async function setItemsPurchaseStateAction(
  itemIds: string[],
  purchased: boolean,
): Promise<ActionState> {
  await requireUser();
  const parsedIds = idSchema.array().min(1).max(100).safeParse(itemIds);
  if (!parsedIds.success || typeof purchased !== "boolean") {
    return { status: "error", message: "Selecciona entre 1 y 100 ítems válidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_items_purchase_state", {
    target_item_ids: [...new Set(parsedIds.data)],
    purchased,
  });

  if (error) {
    if (error.code === "42501") return { status: "error", message: "Solo puedes cambiar el estado de tus propios ítems." };
    if (error.code === "P0003") return { status: "error", message: "Uno o más ítems no existen en tu tenant." };
    if (error.code === "28000") return { status: "error", message: "Sesión expirada. Inicia sesión nuevamente." };
    if (error.code === "22023") return { status: "error", message: "La selección de ítems es inválida." };
    return { status: "error", message: getActionError(error) };
  }

  refreshItemViews();
  const count = data ?? 0;
  return {
    status: "success",
    message: purchased
      ? count === 1 ? "Ítem marcado como comprado." : `${count} ítems marcados como comprados.`
      : count === 1 ? "Ítem desmarcado como comprado." : `${count} ítems desmarcados como comprados.`,
  };
}
