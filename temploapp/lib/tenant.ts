import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function requireCurrentTenantId(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("current_tenant_id");

  if (error || !data) {
    throw new Error("No se pudo resolver el tenant de la sesión actual.");
  }

  return data;
}
