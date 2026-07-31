"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { superAdminTenantSchema } from "@/lib/validation";

type TenantField = "tenantName" | "adminName" | "email" | "password" | "confirmPassword";

export type CreateTenantResult =
  | {
      success: true;
      message: string;
      tenant: { id: string; name: string };
      administrator: { id: string; fullName: string };
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<TenantField, string>>;
    };

async function rollbackProvisioning({
  admin,
  userId,
  tenantId,
}: {
  admin: ReturnType<typeof createAdminClient>;
  userId: string;
  tenantId?: string;
}) {
  const { error: userRollbackError } = await admin.auth.admin.deleteUser(userId);
  let tenantRollbackError: { message: string } | null = null;

  if (tenantId && !userRollbackError) {
    const { error } = await admin.from("tenants").delete().eq("id", tenantId);
    tenantRollbackError = error;
  }

  return !userRollbackError && !tenantRollbackError;
}

export async function createTenantWithAdminAction(
  _previousState: CreateTenantResult,
  formData: FormData,
): Promise<CreateTenantResult> {
  const sessionClient = await createClient();
  const { data: authData, error: authError } = await sessionClient.auth.getUser();

  if (authError || !authData.user) {
    return { success: false, message: "Sesión expirada. Inicia sesión nuevamente." };
  }

  const { data: isSuperAdmin, error: authorizationError } = await sessionClient.rpc("is_super_admin");
  if (authorizationError || isSuperAdmin !== true) {
    return { success: false, message: "No tienes permisos para crear templos." };
  }

  const parsed = superAdminTenantSchema.safeParse({
    tenantName: formData.get("tenantName"),
    adminName: formData.get("adminName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    ) as Partial<Record<TenantField, string>>;
    return { success: false, message: "Revisa los campos marcados.", fieldErrors };
  }

  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true") {
    return { success: false, message: "La creación de templos no está disponible en modo demo." };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, message: "No se pudo configurar la creación administrativa." };
  }

  const { data: created, error: createUserError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.adminName },
  });

  if (createUserError || !created.user) {
    return {
      success: false,
      message: createUserError?.code === "email_exists"
        ? "Ya existe un usuario con ese email."
        : "No se pudo crear el administrador inicial.",
    };
  }

  const createdUserId = created.user.id;
  const { data: provisionedRows, error: provisioningError } = await sessionClient.rpc(
    "create_tenant_with_admin",
    {
      tenant_name: parsed.data.tenantName,
      target_admin_user_id: createdUserId,
      admin_full_name: parsed.data.adminName,
    },
  );
  const provisioned = provisionedRows?.[0];

  if (provisioningError || !provisioned) {
    const rolledBack = await rollbackProvisioning({ admin, userId: createdUserId });
    return {
      success: false,
      message: provisioningError?.code === "23505"
        ? "Ya existe un templo con ese nombre."
        : rolledBack
          ? "No se pudo crear el templo; el usuario fue revertido."
          : "No se pudo completar la creación y el rollback requiere revisión.",
    };
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(createdUserId, {
    app_metadata: { tenant_id: provisioned.tenant_id },
  });

  if (metadataError) {
    const rolledBack = await rollbackProvisioning({
      admin,
      userId: createdUserId,
      tenantId: provisioned.tenant_id,
    });
    return {
      success: false,
      message: rolledBack
        ? "No se pudo completar la cuenta; los datos creados fueron revertidos."
        : "No se pudo completar la cuenta y el rollback requiere revisión.",
    };
  }

  return {
    success: true,
    message: "Templo y administrador creados correctamente.",
    tenant: { id: provisioned.tenant_id, name: provisioned.name },
    administrator: { id: createdUserId, fullName: parsed.data.adminName },
  };
}
