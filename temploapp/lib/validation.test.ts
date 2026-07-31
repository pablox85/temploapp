import { describe, expect, it } from "vitest";
import { collaborativeListTitleSchema, extraListSchema, passwordRecoveryRequestSchema, passwordResetSchema, superAdminTenantSchema, tenantIdSchema } from "@/lib/validation";

describe("tenantIdSchema", () => {
  it("accepts the seeded PostgreSQL tenant UUID", () => {
    expect(
      tenantIdSchema.safeParse("00000000-0000-0000-0000-000000000001")
        .success,
    ).toBe(true);
  });

  it("accepts generated RFC UUIDs", () => {
    expect(
      tenantIdSchema.safeParse("38cb75b8-4f59-4434-8a11-b87cfc3f41cf")
        .success,
    ).toBe(true);
  });

  it("rejects malformed tenant identifiers", () => {
    expect(tenantIdSchema.safeParse("not-a-uuid").success).toBe(false);
  });
});

describe("extraListSchema", () => {
  it("cleans the name and accepts a supported list type", () => {
    expect(
      extraListSchema.parse({ name: "  Tareas   del evento ", type: "checklist" }),
    ).toEqual({ name: "Tareas del evento", type: "checklist" });
  });

  it("rejects unsupported list types", () => {
    expect(
      extraListSchema.safeParse({ name: "Otra lista", type: "calendar" }).success,
    ).toBe(false);
  });
});

describe("collaborativeListTitleSchema", () => {
  it("cleans a shared title", () => {
    expect(collaborativeListTitleSchema.parse("  Compras   del mes  ")).toBe("Compras del mes");
  });

  it("accepts an empty title to restore the default label", () => {
    expect(collaborativeListTitleSchema.parse("   ")).toBe("");
  });

  it("rejects titles longer than 80 characters", () => {
    expect(collaborativeListTitleSchema.safeParse("a".repeat(81)).success).toBe(false);
  });
});

describe("superAdminTenantSchema", () => {
  const validInput = {
    tenantName: "Templo Norte",
    adminName: "Ana Pérez",
    email: "ana@example.com",
    password: "secreto123",
    confirmPassword: "secreto123",
  };

  it("normalizes names and accepts a valid tenant provision", () => {
    expect(superAdminTenantSchema.parse({
      ...validInput,
      tenantName: "  Templo   Norte ",
      adminName: " Ana   Pérez ",
    })).toMatchObject({ tenantName: "Templo Norte", adminName: "Ana Pérez" });
  });

  it("rejects mismatched passwords", () => {
    expect(superAdminTenantSchema.safeParse({
      ...validInput,
      confirmPassword: "otra-clave",
    }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(superAdminTenantSchema.safeParse({
      ...validInput,
      email: "correo-invalido",
    }).success).toBe(false);
  });
});

describe("passwordResetSchema", () => {
  it("accepts a password that follows the existing minimum length rule", () => {
    expect(passwordResetSchema.safeParse({
      password: "nueva-clave",
      confirmPassword: "nueva-clave",
    }).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    expect(passwordResetSchema.safeParse({
      password: "nueva-clave",
      confirmPassword: "otra-clave",
    }).success).toBe(false);
  });
});

describe("passwordRecoveryRequestSchema", () => {
  it("accepts a valid user email", () => {
    expect(passwordRecoveryRequestSchema.safeParse({ email: "persona@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(passwordRecoveryRequestSchema.safeParse({ email: "persona" }).success).toBe(false);
  });
});
