"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileRoleChangeSchema } from "@/lib/validation";
import type { AppRole } from "@/lib/types/database";

export type UpdateProfileRoleResult =
  | { success: true; message: string; role: AppRole; changed: boolean }
  | { success: false; message: string };

export async function updateProfileRoleAction(
  profileId: string,
  _previousState: UpdateProfileRoleResult,
  formData: FormData,
): Promise<UpdateProfileRoleResult> {
  const parsed = profileRoleChangeSchema.safeParse({ profileId, role: formData.get("role") });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { success: false, message: "Sesión expirada. Inicia sesión nuevamente." };

  const { data: actor, error: actorError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (actorError || !actor || actor.role !== "admin") {
    return { success: false, message: "No tienes permisos para cambiar roles." };
  }

  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true") {
    return { success: false, message: "La gestión de roles no está disponible en modo demo." };
  }

  const { data, error } = await supabase.rpc("change_profile_role", {
    target_profile_id: parsed.data.profileId,
    new_role: parsed.data.role,
  });
  if (error) {
    if (error.code === "P0002") return { success: false, message: "El usuario seleccionado no existe." };
    if (error.code === "P0001") return { success: false, message: "No se puede degradar al último administrador." };
    if (error.code === "42501") return { success: false, message: "No tienes permisos para cambiar roles." };
    if (error.code === "28000") return { success: false, message: "Sesión expirada. Inicia sesión nuevamente." };
    return { success: false, message: "No se pudo actualizar el rol. Inténtalo nuevamente." };
  }

  const result = data?.[0];
  if (!result) return { success: false, message: "No se pudo actualizar el rol. Inténtalo nuevamente." };
  revalidatePath("/dashboard/admin/users");
  return {
    success: true,
    message: result.changed ? "Rol actualizado correctamente." : "El usuario ya tenía ese rol.",
    role: result.role,
    changed: result.changed,
  };
}
