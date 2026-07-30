import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ExtraList, ExtraListEntries } from "@/lib/types/database";

export type InventoryDashboardList = Pick<ExtraList, "id" | "name"> & {
  itemCount: number;
};

export async function getExtraLists(): Promise<ExtraList[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_lists")
    .select("id, name, list_type, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar las listas extra: ${error.message}`);
  return data ?? [];
}

export async function getInventoryDashboardLists(): Promise<InventoryDashboardList[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_lists")
    .select("id, name, extra_list_entries(count)")
    .eq("list_type", "inventory")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar los inventarios: ${error.message}`);
  return (data ?? []).map((list) => ({
    id: list.id,
    name: list.name,
    itemCount: list.extra_list_entries[0]?.count ?? 0,
  }));
}

export async function getExtraListByName(listName: string): Promise<ExtraList | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_lists")
    .select("id, name, list_type, created_by, created_at")
    .eq("name", listName)
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar la lista extra: ${error.message}`);
  return data;
}

export async function getExtraListEntries(listId: string): Promise<ExtraListEntries> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_list_entries")
    .select("id, list_id, entry_type, title, content, quantity, is_completed, created_at, updated_at")
    .eq("list_id", listId)
    .order("position")
    .order("created_at");

  if (error) throw new Error(`No se pudo cargar el contenido de la lista: ${error.message}`);

  const entries: ExtraListEntries = { inventory: [], checklist: [], notes: [] };
  for (const entry of data ?? []) {
    if (entry.entry_type === "inventory" && entry.quantity !== null) {
      entries.inventory.push({
        id: entry.id,
        list_id: entry.list_id,
        entry_type: "inventory",
        title: entry.title,
        quantity: entry.quantity,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      });
    } else if (entry.entry_type === "checklist" && entry.is_completed !== null) {
      entries.checklist.push({
        id: entry.id,
        list_id: entry.list_id,
        entry_type: "checklist",
        title: entry.title,
        is_completed: entry.is_completed,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      });
    } else if (entry.entry_type === "notes" && entry.content !== null) {
      entries.notes.push({
        id: entry.id,
        list_id: entry.list_id,
        entry_type: "notes",
        title: entry.title,
        content: entry.content,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      });
    }
  }

  return entries;
}
