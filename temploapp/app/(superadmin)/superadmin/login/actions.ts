"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";

export async function superAdminLoginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { status: "error", message: "Email o contraseña incorrectos." };
  }

  const { data: isSuperAdmin, error: authorizationError } = await supabase.rpc("is_super_admin");

  if (authorizationError || isSuperAdmin !== true) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: authorizationError
        ? "No se pudo validar el acceso de SuperAdmin. Inténtalo nuevamente."
        : "Esta cuenta no tiene permisos de SuperAdmin.",
    };
  }

  redirect("/superadmin/tenants/new");
}

export async function superAdminSignOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
