"use client";

import { type FormEvent, useState } from "react";

type FieldName = "tenantName" | "adminName" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;
type FormStatus = "idle" | "loading" | "error" | "success";

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

function readFormValues(form: HTMLFormElement): Record<FieldName, string> {
  return Object.fromEntries(fieldDefinitions.map(({ name }) => [name, String(new FormData(form).get(name) ?? "").trim()])) as Record<FieldName, string>;
}

function validate(values: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};
  for (const { name, label } of fieldDefinitions) {
    if (!values[name]) errors[name] = `${label} es obligatorio.`;
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Ingresa un email válido.";
  if (values.password && values.confirmPassword && values.password !== values.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";
  return errors;
}

export function SuperAdminTenantForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validate(readFormValues(form));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    window.setTimeout(() => {
      form.reset();
      setErrors({});
      setStatus("success");
    }, 650);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby="tenant-form-status">
      <fieldset disabled={status === "loading"} className="space-y-5 disabled:opacity-70">
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
        {status === "loading" && <p className="rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-slate-300">Preparando la creación…</p>}
        {status === "error" && Object.keys(errors).length === 0 && <p className="rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm text-rose-200">Revisa los datos ingresados.</p>}
        {status === "success" && <p className="rounded-xl bg-teal-500/15 px-3 py-2.5 text-sm text-teal-200">¡Listo! La creación del templo se simulará en la próxima etapa.</p>}
      </div>

      <button type="submit" disabled={status === "loading"} className="button-primary min-h-12 w-full">
        {status === "loading" ? "Creando templo…" : "Crear templo y administrador"}
      </button>
    </form>
  );
}
