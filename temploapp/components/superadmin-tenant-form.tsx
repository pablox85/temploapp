"use client";

import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";
import {
  createTenantWithAdminAction,
  type CreateTenantResult,
} from "@/app/superadmin/tenants/new/actions";

type FieldName = "tenantName" | "adminName" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;

const initialState: CreateTenantResult = { success: false, message: "" };

const fieldDefinitions: Array<{
  name: FieldName;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autoComplete?: string;
}> = [
  { name: "tenantName", label: "Nombre del templo", type: "text", placeholder: "Ej. Templo Central" },
  { name: "adminName", label: "Nombre del administrador", type: "text", placeholder: "Ej. Ana Pérez" },
  { name: "email", label: "Email", type: "email", placeholder: "administrador@ejemplo.com", autoComplete: "email" },
  { name: "password", label: "Contraseña temporal", type: "password", placeholder: "Mínimo 6 caracteres", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirmar contraseña", type: "password", placeholder: "Repite la contraseña", autoComplete: "new-password" },
];

function validateClient(form: HTMLFormElement): FieldErrors {
  const formData = new FormData(form);
  const values = {
    tenantName: String(formData.get("tenantName") ?? "").trim(),
    adminName: String(formData.get("adminName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  } satisfies Record<FieldName, string>;
  const errors: FieldErrors = {};

  if (!values.tenantName) errors.tenantName = "El nombre del templo es obligatorio.";
  if (!values.adminName) errors.adminName = "El nombre del administrador es obligatorio.";
  if (!values.email) errors.email = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Ingresa un email válido.";
  if (!values.password) errors.password = "La contraseña es obligatoria.";
  else if (values.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
  if (!values.confirmPassword) errors.confirmPassword = "Confirma la contraseña.";
  else if (values.password !== values.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";

  return errors;
}

export function SuperAdminTenantForm() {
  const [state, action, pending] = useActionState(createTenantWithAdminAction, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const serverErrors = state.success ? {} : state.fieldErrors ?? {};
  const errors = { ...serverErrors, ...clientErrors };

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
  }, [state.success]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const nextErrors = validateClient(event.currentTarget);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) event.preventDefault();
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby="tenant-form-status">
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
        {fieldDefinitions.map(({ name, label, type, placeholder, autoComplete }) => {
          const errorId = `${name}-error`;
          return (
            <div key={name}>
              <label className="label text-slate-200" htmlFor={name}>{label}</label>
              <input
                className="input border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 hover:border-slate-600"
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                minLength={type === "password" ? 6 : undefined}
                maxLength={name === "tenantName" || name === "adminName" ? 120 : undefined}
                aria-invalid={Boolean(errors[name])}
                aria-describedby={errors[name] ? errorId : undefined}
                required
              />
              {errors[name] && <p id={errorId} className="mt-1.5 text-sm text-rose-300">{errors[name]}</p>}
            </div>
          );
        })}
      </fieldset>

      <div id="tenant-form-status" aria-live="polite" role="status">
        {pending && <p className="rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-slate-300">Creando el templo y su administrador…</p>}
        {!pending && state.message && <p className={`rounded-xl px-3 py-2.5 text-sm ${state.success ? "bg-teal-500/15 text-teal-200" : "bg-rose-500/15 text-rose-200"}`}>{state.message}</p>}
        {!pending && Object.keys(clientErrors).length > 0 && !state.message && <p className="rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm text-rose-200">Revisa los campos marcados.</p>}
      </div>

      <button type="submit" disabled={pending} className="button-primary min-h-12 w-full">
        {pending ? "Creando templo…" : "Crear templo y administrador"}
      </button>
    </form>
  );
}
