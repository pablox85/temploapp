import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ExtraList } from "@/lib/types/database";

export async function getExtraLists(): Promise<ExtraList[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extra_lists")
    .select("id, name, list_type, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar las listas extra: ${error.message}`);
  return data ?? [];
}
