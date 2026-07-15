"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import { loginSchema } from "@/lib/validation";
import { usernameToAuthEmail } from "@/lib/auth/username";

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToAuthEmail(parsed.data.name),
    password: parsed.data.password,
  });
  if (error) return { status: "error", message: "Nombre o contraseña incorrectos." };

  const requestedPath = String(formData.get("redirectTo") ?? "/dashboard");
  redirect(requestedPath.startsWith("/dashboard") ? requestedPath : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
