import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const isCurrentUserSuperAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_super_admin");
  return !error && data === true;
});

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/superadmin/login");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_super_admin");

  if (error) redirect("/superadmin/login?error=validation");
  if (data !== true) redirect("/superadmin/login?error=forbidden");

  return user;
}
