"use server";

import { revalidatePath } from "next/cache";
import { getActionError, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { extraListSchema } from "@/lib/validation";

export async function createExtraListAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireAdmin();
  const parsed = extraListSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("extra_lists").insert({
    name: parsed.data.name,
    list_type: parsed.data.type,
    created_by: profile.id,
  });

  if (error?.code === "23505") {
    return { status: "error", message: "Ya existe una lista extra con ese nombre." };
  }
  if (error) return { status: "error", message: getActionError(error) };

  revalidatePath("/dashboard/extras");
  return { status: "success", message: `Lista “${parsed.data.name}” creada.` };
}
