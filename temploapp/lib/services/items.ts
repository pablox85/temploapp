import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ItemWithSelection } from "@/lib/types/database";

type ItemWithCountRow = {
  id: string;
  name: string;
  normalized_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_items: { count: number }[];
};

export async function getItems(userId: string): Promise<ItemWithSelection[]> {
  const supabase = await createClient();
  const [{ data: items, error }, { data: selected }] = await Promise.all([
    supabase
      .from("items")
      .select("id, name, normalized_name, created_by, created_at, updated_at, user_items(count)")
      .order("name"),
    supabase.from("user_items").select("item_id").eq("user_id", userId),
  ]);

  if (error) throw new Error(`No se pudieron cargar los ítems: ${error.message}`);
  const selectedIds = new Set((selected ?? []).map((row) => row.item_id));

  return ((items ?? []) as ItemWithCountRow[]).map(({ user_items, ...item }) => ({
    ...item,
    selection_count: user_items[0]?.count ?? 0,
    is_selected: selectedIds.has(item.id),
    is_available: (user_items[0]?.count ?? 0) === 0,
  }));
}

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();
  const [items, mine, assignments] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase
      .from("user_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("user_items").select("id", { count: "exact", head: true }),
  ]);

  return {
    items: items.count ?? 0,
    mine: mine.count ?? 0,
    assignments: assignments.count ?? 0,
  };
}
