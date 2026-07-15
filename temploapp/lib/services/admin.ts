import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Item, Profile, UserItem } from "@/lib/types/database";

export type AdminData = {
  profiles: Profile[];
  items: Item[];
  assignments: UserItem[];
};

export type AdminUserListItem = Pick<Profile, "id" | "full_name" | "role" | "created_at">;

export async function listAdminProfiles(): Promise<AdminUserListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("No se pudo cargar el listado de usuarios.");
  return data ?? [];
}

export async function getAdminData(): Promise<AdminData> {
  const supabase = await createClient();
  const [profiles, items, assignments] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("items").select("*").order("name"),
    supabase.from("user_items").select("*").order("created_at", { ascending: false }),
  ]);

  const error = profiles.error ?? items.error ?? assignments.error;
  if (error) throw new Error(`No se pudo cargar el panel: ${error.message}`);

  return {
    profiles: profiles.data ?? [],
    items: items.data ?? [],
    assignments: assignments.data ?? [],
  };
}
