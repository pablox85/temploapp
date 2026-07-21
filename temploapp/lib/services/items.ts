import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ItemWithSelection } from "@/lib/types/database";

export async function getItems(userId: string): Promise<ItemWithSelection[]> {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("items")
    .select(`
      id,
      name,
      normalized_name,
      created_by,
      created_at,
      updated_at,
      user_items!user_items_item_id_fkey(
        user_id,
        profiles!user_items_user_id_fkey(id, full_name)
      )
    `)
    .order("name");

  if (error) throw new Error(`No se pudieron cargar los ítems: ${error.message}`);

  return (items ?? []).map(({ user_items, ...item }) => {
    const assignment = user_items;

    return {
      ...item,
      selection_count: assignment === null ? 0 : 1,
      is_selected: assignment?.user_id === userId,
      is_available: assignment === null,
      assigned_profile: assignment?.profiles ?? null,
    };
  });
}

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();
  const [items, mine, assignments, users] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase
      .from("user_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("user_items").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const totalItems = items.count ?? 0;
  const totalAssignments = assignments.count ?? 0;

  return {
    items: totalItems,
    availableItems: Math.max(0, totalItems - totalAssignments),
    mine: mine.count ?? 0,
    assignments: totalAssignments,
    users: users.count ?? 0,
  };
}
