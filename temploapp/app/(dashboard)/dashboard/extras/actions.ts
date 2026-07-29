"use server";

import { revalidatePath } from "next/cache";
import { getActionError, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  checklistEntrySchema,
  checklistStatusSchema,
  extraEntryDeleteSchema,
  extraListSchema,
  idSchema,
  inventoryEntrySchema,
  inventoryQuantitySchema,
  notesEntrySchema,
} from "@/lib/validation";
import type { ExtraListType } from "@/lib/types/database";

function revalidateExtraList(listName: string) {
  revalidatePath(`/dashboard/extras/${encodeURIComponent(listName)}`);
}

async function extraListExists(listId: string, listType: ExtraListType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_lists")
    .select("id")
    .eq("id", listId)
    .eq("list_type", listType)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createExtraListAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireAdmin();
  const parsed = extraListSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("extra_lists").insert({
    name: parsed.data.name,
    list_type: parsed.data.type,
    created_by: profile.id,
  });

  if (error?.code === "23505") {
    return { status: "error", message: "Ya existe una lista extra con ese nombre." };
  }
  if (error) return { status: "error", message: getActionError(error) };

  revalidatePath("/dashboard/extras");
  return { status: "success", message: `Lista “${parsed.data.name}” creada.` };
}

export async function deleteExtraListAction(listId: string): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(listId);
  if (!parsedId.success) {
    return { status: "error", message: "La lista seleccionada no es válida." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_lists")
    .delete()
    .eq("id", parsedId.data)
    .select("id");

  if (error) return { status: "error", message: getActionError(error) };
  if (!data?.length) {
    return { status: "error", message: "La lista no existe o no pertenece a tu tenant." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/extras");
  return { status: "success", message: "Lista eliminada." };
}

export async function createInventoryEntryAction(
  listId: string,
  listName: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireAdmin();
  const parsed = inventoryEntrySchema.safeParse({
    listId,
    title: formData.get("title"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  if (!await extraListExists(parsed.data.listId, "inventory")) {
    return { status: "error", message: "La lista de inventario no existe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("extra_list_entries").insert({
    list_id: parsed.data.listId,
    entry_type: "inventory",
    title: parsed.data.title,
    quantity: parsed.data.quantity,
    created_by: profile.id,
  });

  if (error?.code === "23505") return { status: "error", message: "Ese producto ya existe en el inventario." };
  if (error) return { status: "error", message: getActionError(error) };
  revalidateExtraList(listName);
  return { status: "success", message: `Producto “${parsed.data.title}” agregado.` };
}

export async function updateInventoryQuantityAction(
  listId: string,
  listName: string,
  entryId: string,
  quantity: number,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = inventoryQuantitySchema.safeParse({ listId, entryId, quantity });
  if (!parsed.success) return { status: "error", message: "La cantidad debe estar entre 0 y 999999." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_list_entries")
    .update({ quantity: parsed.data.quantity })
    .eq("id", parsed.data.entryId)
    .eq("list_id", parsed.data.listId)
    .eq("entry_type", "inventory")
    .select("id");

  if (error) return { status: "error", message: getActionError(error) };
  if (!data?.length) return { status: "error", message: "El producto no existe en esta lista." };
  revalidateExtraList(listName);
  return { status: "success", message: "Cantidad actualizada." };
}

export async function createChecklistEntryAction(
  listId: string,
  listName: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireAdmin();
  const parsed = checklistEntrySchema.safeParse({ listId, title: formData.get("title") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  if (!await extraListExists(parsed.data.listId, "checklist")) {
    return { status: "error", message: "La lista de checklist no existe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("extra_list_entries").insert({
    list_id: parsed.data.listId,
    entry_type: "checklist",
    title: parsed.data.title,
    is_completed: false,
    created_by: profile.id,
  });

  if (error) return { status: "error", message: getActionError(error) };
  revalidateExtraList(listName);
  return { status: "success", message: `Tarea “${parsed.data.title}” agregada.` };
}

export async function updateChecklistStatusAction(
  listId: string,
  listName: string,
  entryId: string,
  completed: boolean,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = checklistStatusSchema.safeParse({ listId, entryId, completed });
  if (!parsed.success) return { status: "error", message: "La tarea seleccionada no es válida." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_list_entries")
    .update({ is_completed: parsed.data.completed })
    .eq("id", parsed.data.entryId)
    .eq("list_id", parsed.data.listId)
    .eq("entry_type", "checklist")
    .select("id");

  if (error) return { status: "error", message: getActionError(error) };
  if (!data?.length) return { status: "error", message: "La tarea no existe en esta lista." };
  revalidateExtraList(listName);
  return { status: "success", message: parsed.data.completed ? "Tarea completada." : "Tarea marcada como pendiente." };
}

export async function createNotesEntryAction(
  listId: string,
  listName: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireAdmin();
  const parsed = notesEntrySchema.safeParse({
    listId,
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  if (!await extraListExists(parsed.data.listId, "notes")) {
    return { status: "error", message: "La lista de notas no existe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("extra_list_entries").insert({
    list_id: parsed.data.listId,
    entry_type: "notes",
    title: parsed.data.title,
    content: parsed.data.content,
    created_by: profile.id,
  });

  if (error) return { status: "error", message: getActionError(error) };
  revalidateExtraList(listName);
  return { status: "success", message: `Nota “${parsed.data.title}” agregada.` };
}

export async function deleteExtraListEntryAction(
  listId: string,
  listName: string,
  entryId: string,
  entryType: ExtraListType,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = extraEntryDeleteSchema.safeParse({ listId, entryId, entryType });
  if (!parsed.success) return { status: "error", message: "El elemento seleccionado no es válido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_list_entries")
    .delete()
    .eq("id", parsed.data.entryId)
    .eq("list_id", parsed.data.listId)
    .eq("entry_type", parsed.data.entryType)
    .select("id");

  if (error) return { status: "error", message: getActionError(error) };
  if (!data?.length) return { status: "error", message: "El elemento ya no existe en esta lista." };
  revalidateExtraList(listName);
  return { status: "success", message: "Elemento eliminado." };
}
