import { z } from "zod";

export const itemNameSchema = z
  .string()
  .trim()
  .min(1, "Escribe un nombre.")
  .max(160, "El nombre no puede superar los 160 caracteres.")
  .transform((value) => value.replace(/\s+/g, " "));

export const idSchema = z.string().uuid("Identificador inválido.");

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

export const profileRoleChangeSchema = z.object({
  profileId: idSchema,
  role: z.enum(["user", "admin"], { message: "El rol seleccionado no es válido." }),
});

export const itemAssignmentSchema = z.object({
  userId: idSchema,
  itemId: idSchema,
});
