import { z } from "zod";
import { EXTRA_LIST_TYPES } from "@/lib/extra-lists";

export const itemNameSchema = z
  .string()
  .trim()
  .min(1, "Escribe un nombre.")
  .max(160, "El nombre no puede superar los 160 caracteres.")
  .transform((value) => value.replace(/\s+/g, " "));

export const collaborativeListTitleSchema = z
  .string()
  .trim()
  .max(80, "El título no puede superar los 80 caracteres.")
  .transform((value) => value.replace(/\s+/g, " "));

export const idSchema = z.string().uuid("Identificador inválido.");

// PostgreSQL accepts canonical UUID values regardless of RFC version/variant.
// The seeded tenant uses 00000000-0000-0000-0000-000000000001, which is a
// valid PostgreSQL uuid but is intentionally rejected by Zod's strict uuid().
export const tenantIdSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Tenant inválido.",
  );

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "Escribe tu nombre.")
  .max(120, "El nombre no puede superar los 120 caracteres.")
  .transform((value) => value.replace(/\s+/g, " "));

export const loginSchema = z.object({
  email: z.email("Escribe un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const adminUserSchema = z
  .object({
    fullName: personNameSchema,
    email: z.email("Escribe un email válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string(),
    role: z.enum(["user", "admin"], { message: "El rol seleccionado no es válido." }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const superAdminTenantSchema = z
  .object({
    tenantName: z
      .string()
      .trim()
      .min(1, "Escribe el nombre del templo.")
      .max(120, "El nombre del templo no puede superar los 120 caracteres.")
      .transform((value) => value.replace(/\s+/g, " ")),
    adminName: z
      .string()
      .trim()
      .min(1, "Escribe el nombre del administrador.")
      .max(120, "El nombre no puede superar los 120 caracteres.")
      .transform((value) => value.replace(/\s+/g, " ")),
    email: z.email("Escribe un email válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const profileRoleChangeSchema = z.object({
  profileId: idSchema,
  role: z.enum(["user", "admin"], { message: "El rol seleccionado no es válido." }),
});

export const itemAssignmentSchema = z.object({
  userId: idSchema,
  itemId: idSchema,
});

export const extraListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe un nombre para la lista.")
    .max(120, "El nombre no puede superar los 120 caracteres.")
    .transform((value) => value.replace(/\s+/g, " ")),
  type: z.enum(EXTRA_LIST_TYPES.map((type) => type.value), {
    message: "Selecciona un tipo de lista válido.",
  }),
});

const extraEntryTitleSchema = z
  .string()
  .trim()
  .min(1, "Escribe un nombre.")
  .max(200, "El nombre no puede superar los 200 caracteres.")
  .transform((value) => value.replace(/\s+/g, " "));

export const inventoryEntrySchema = z.object({
  listId: idSchema,
  title: extraEntryTitleSchema,
  quantity: z.coerce.number().int("La cantidad debe ser un número entero.").min(1, "La cantidad mínima es 1.").max(999999, "La cantidad máxima es 999999."),
});

export const inventoryQuantitySchema = z.object({
  listId: idSchema,
  entryId: idSchema,
  quantity: z.number().int().min(0).max(999999),
});

export const checklistEntrySchema = z.object({
  listId: idSchema,
  title: extraEntryTitleSchema,
});

export const checklistStatusSchema = z.object({
  listId: idSchema,
  entryId: idSchema,
  completed: z.boolean(),
});

export const notesEntrySchema = z.object({
  listId: idSchema,
  title: extraEntryTitleSchema,
  content: z.string().trim().min(1, "Escribe el contenido de la nota.").max(5000, "La nota no puede superar los 5000 caracteres."),
});

export const extraEntryDeleteSchema = z.object({
  listId: idSchema,
  entryId: idSchema,
  entryType: z.enum(["inventory", "checklist", "notes"]),
});
