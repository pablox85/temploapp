import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

export function createClient() {
  const { url, key } = getSupabaseConfig();

  console.info("[Supabase browser] Creando cliente", { url });

  return createBrowserClient<Database>(url, key);
}
