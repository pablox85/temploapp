"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanUsername, normalizedName, usernameToAuthEmail } from "@/lib/auth/username";
import { adminUserSchema } from "@/lib/validation";

export type CreateAdminUserResult =
  | { success: true; message: string; user: { id: string; fullName: string; role: "user" | "admin" } }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<"fullName" | "password" | "confirmPassword" | "role", string>>;
    };

export async function createAdminUserAction(
  _previousState: CreateAdminUserResult,
  formData: FormData,
): Promise<CreateAdminUserResult> {
  const sessionClient = await createClient();
  const { data: authData, error: authError } = await sessionClient.auth.getUser();
  if (authError || !authData.user) return { success: false, message: "Sesión expirada. Inicia sesión nuevamente." };

  const { data: actor, error: actorError } = await sessionClient
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (actorError || !actor || actor.role !== "admin") {
    return { success: false, message: "No tienes permisos para crear usuarios." };
  }

  const parsed = adminUserSchema.safeParse({
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    );
    return { success: false, message: "Revisa los campos marcados.", fieldErrors };
  }

  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true") {
    return { success: false, message: "La creación de usuarios no está disponible en modo demo." };
  }

  const fullName = cleanUsername(parsed.data.fullName);
  const normalized = normalizedName(fullName);
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, message: "Error inesperado del servidor." };
  }
  const { data: existing, error: existingError } = await admin
    .from("profiles")
    .select("id")
    .eq("normalized_name", normalized)
    .maybeSingle();
  if (existingError) return { success: false, message: "No se pudo verificar el nombre." };
  if (existing) return { success: false, message: "Ya existe un usuario con ese nombre." };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: usernameToAuthEmail(fullName),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) {
    if (createError?.code === "email_exists") return { success: false, message: "Ya existe un usuario con ese nombre." };
    return { success: false, message: "No se pudo crear el usuario." };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, normalized_name: normalized, role: parsed.data.role })
    .eq("id", created.user.id)
    .select("id, full_name, role")
    .maybeSingle();
  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, message: "No se pudo completar el perfil; el usuario fue revertido." };
  }

  revalidatePath("/dashboard/admin/users");
  return { success: true, message: "Usuario creado correctamente.", user: { id: profile.id, fullName: profile.full_name, role: profile.role } };
}
