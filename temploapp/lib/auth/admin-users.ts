"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminUserSchema, tenantIdSchema } from "@/lib/validation";

const isDevelopment = process.env.NODE_ENV !== "production";

type ErrorDiagnostic = {
  name?: string;
  message?: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: string;
};

function toErrorDiagnostic(error: unknown): ErrorDiagnostic | null {
  if (!error) return null;
  if (typeof error !== "object") return { message: String(error) };

  const value = error as Record<string, unknown>;
  return {
    ...(typeof value.name === "string" ? { name: value.name } : {}),
    ...(typeof value.message === "string" ? { message: value.message } : {}),
    ...(typeof value.code === "string" ? { code: value.code } : {}),
    ...(typeof value.status === "number" ? { status: value.status } : {}),
    ...(typeof value.details === "string" ? { details: value.details } : {}),
    ...(typeof value.hint === "string" ? { hint: value.hint } : {}),
  };
}

function logDevelopment(event: string, details: Record<string, unknown>) {
  if (isDevelopment) console.log(`[createAdminUser] ${event}`, details);
}

function logDevelopmentError(
  event: string,
  details: Record<string, unknown>,
) {
  if (isDevelopment) console.error(`[createAdminUser] ${event}`, details);
}

export type CreateAdminUserResult =
  | {
      success: true;
      message: string;
      user: {
        id: string;
        fullName: string;
        role: "user" | "admin";
      };
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<
        Record<
          "fullName" | "email" | "password" | "confirmPassword" | "role",
          string
        >
      >;
    };

export async function createAdminUserAction(
  _previousState: CreateAdminUserResult,
  formData: FormData,
): Promise<CreateAdminUserResult> {
  const sessionClient = await createClient();

  const { data: authData, error: authError } =
    await sessionClient.auth.getUser();

  if (authError || !authData.user) {
    logDevelopmentError("session validation failed", {
      error: toErrorDiagnostic(authError),
      hasUser: Boolean(authData.user),
    });

    return {
      success: false,
      message: "Sesión expirada. Inicia sesión nuevamente.",
    };
  }

  logDevelopment("authenticated user", { userId: authData.user.id });

  let resolvedTenantId: string | null = null;
  if (isDevelopment) {
    const { data: tenantRpc, error: tenantRpcError } =
      await sessionClient.rpc("current_tenant_id");
    resolvedTenantId = tenantRpc ?? null;

    logDevelopment("current tenant RPC", {
      tenantId: resolvedTenantId,
      error: toErrorDiagnostic(tenantRpcError),
    });
  }

  const { data: adminProfile, error: adminProfileError } =
    await sessionClient
      .from("profiles")
      .select("id, role, tenant_id")
      .eq("id", authData.user.id)
      .maybeSingle();

  logDevelopment("admin profile query", {
    profile: adminProfile
      ? {
          id: adminProfile.id,
          role: adminProfile.role,
          tenantId: adminProfile.tenant_id,
        }
      : null,
    error: toErrorDiagnostic(adminProfileError),
  });

  const tenantValidation = tenantIdSchema.safeParse(adminProfile?.tenant_id);
  logDevelopment("tenant validation", {
    tenantId: adminProfile?.tenant_id ?? null,
    valid: tenantValidation.success,
    matchesCurrentTenant:
      tenantValidation.success && resolvedTenantId !== null
        ? tenantValidation.data === resolvedTenantId
        : null,
  });

  if (
    adminProfileError ||
    !adminProfile ||
    adminProfile.role !== "admin" ||
    !tenantValidation.success
  ) {
    logDevelopmentError("admin authorization failed", {
      hasProfile: Boolean(adminProfile),
      role: adminProfile?.role ?? null,
      tenantValid: tenantValidation.success,
      error: toErrorDiagnostic(adminProfileError),
    });

    return {
      success: false,
      message: "No tienes permisos para crear usuarios.",
    };
  }

  const parsed = adminUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((issue) => [
        String(issue.path[0]),
        issue.message,
      ]),
    );

    return {
      success: false,
      message: "Revisa los campos marcados.",
      fieldErrors,
    };
  }

  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true") {
    return {
      success: false,
      message: "La creación de usuarios no está disponible en modo demo.",
    };
  }

  let admin: ReturnType<typeof createAdminClient>;

  try {
    admin = createAdminClient();
  } catch (error) {
    const diagnostic = toErrorDiagnostic(error);
    logDevelopmentError("admin client configuration failed", {
      error: diagnostic,
    });

    return {
      success: false,
      message: isDevelopment
        ? `Error de configuración de Supabase Admin: ${diagnostic?.message ?? "error desconocido"}`
        : "Error inesperado del servidor.",
    };
  }

  logDevelopment("creating Auth user", {
    email: parsed.data.email,
    tenantId: tenantValidation.data,
  });

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName,
      },
      app_metadata: {
        tenant_id: tenantValidation.data,
      },
    });

  if (createError || !created.user) {
    logDevelopmentError("Auth user creation failed", {
      email: parsed.data.email,
      tenantId: tenantValidation.data,
      userReturned: Boolean(created.user),
      error: toErrorDiagnostic(createError),
    });

    if (createError?.code === "email_exists") {
      return {
        success: false,
        message: "Ya existe un usuario con ese email.",
      };
    }

    return {
      success: false,
      message: isDevelopment
        ? createError
          ? `${createError.code ?? createError.name} (HTTP ${createError.status}): ${createError.message}`
          : "Supabase no devolvió el usuario creado."
        : "No se pudo crear el usuario.",
    };
  }

  logDevelopment("Auth user created", { userId: created.user.id });

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      role: parsed.data.role,
    })
    .eq("id", created.user.id)
    .select("id, full_name, role")
    .maybeSingle();

  if (profileError || !profile) {
    logDevelopmentError("profile completion failed", {
      userId: created.user.id,
      error: toErrorDiagnostic(profileError),
      profileReturned: Boolean(profile),
    });

    const { error: rollbackError } =
      await admin.auth.admin.deleteUser(created.user.id);
    logDevelopment("Auth user rollback", {
      userId: created.user.id,
      succeeded: !rollbackError,
      error: toErrorDiagnostic(rollbackError),
    });

    return {
      success: false,
      message:
        "No se pudo completar el perfil; el usuario fue revertido.",
    };
  }

  revalidatePath("/dashboard/admin/users");

  return {
    success: true,
    message: "Usuario creado correctamente.",
    user: {
      id: profile.id,
      fullName: profile.full_name,
      role: profile.role,
    },
  };
}
