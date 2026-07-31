"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { passwordResetSchema } from "@/lib/validation";

type RecoveryStatus = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const recoverySessionRef = useRef(false);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>("checking");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabaseRef.current = supabase;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event !== "PASSWORD_RECOVERY" || !session) return;

      recoverySessionRef.current = true;
      setRecoveryStatus("ready");
    });

    const timeoutId = window.setTimeout(() => {
      if (active && !recoverySessionRef.current) {
        setRecoveryStatus("invalid");
      }
    }, 1000);

    async function verifySession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active || error || !data.session || !recoverySessionRef.current) return;

      setRecoveryStatus("ready");
    }

    void verifySession();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const parsed = passwordResetSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.");
      return;
    }

    const supabase = supabaseRef.current;
    if (!supabase || !recoverySessionRef.current || recoveryStatus !== "ready") {
      setRecoveryStatus("invalid");
      return;
    }

    setPending(true);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session || !recoverySessionRef.current) {
      setPending(false);
      setRecoveryStatus("invalid");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (updateError) {
      setPending(false);
      setMessage("No se pudo actualizar la contraseña. Solicita un enlace nuevo al administrador.");
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (signOutError) {
      setPending(false);
      setMessage("La contraseña se actualizó, pero no se pudo cerrar la sesión temporal. Intenta salir nuevamente.");
      return;
    }

    setSuccess(true);
    setPending(false);
    window.setTimeout(() => router.replace("/login"), 1200);
  }

  if (recoveryStatus === "checking") {
    return <p className="rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-slate-300">Validando el enlace de recuperación…</p>;
  }

  if (recoveryStatus === "invalid") {
    return <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/15 px-4 py-3 text-sm leading-6 text-rose-200">El enlace es inválido o venció. Solicita uno nuevo al administrador.</p>;
  }

  if (success) {
    return <p aria-live="polite" role="status" className="rounded-xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm leading-6 text-teal-100">Contraseña actualizada correctamente. Volviendo al inicio de sesión…</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
        <div>
          <label htmlFor="password" className="label text-slate-200">Nueva contraseña</label>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} className="input border-slate-700 bg-slate-950 pr-12 text-slate-100 placeholder:text-slate-500 hover:border-slate-600" placeholder="Mínimo 6 caracteres" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-teal-300 focus-visible:text-teal-300" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
              {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="label text-slate-200">Confirmar contraseña</label>
          <div className="relative">
            <input id="confirmPassword" name="confirmPassword" type={showConfirmation ? "text" : "password"} autoComplete="new-password" required minLength={6} className="input border-slate-700 bg-slate-950 pr-12 text-slate-100 placeholder:text-slate-500 hover:border-slate-600" placeholder="Repite la contraseña" />
            <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-teal-300 focus-visible:text-teal-300" aria-label={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showConfirmation}>
              {showConfirmation ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </button>
          </div>
        </div>
      </fieldset>
      {message && <p aria-live="polite" role="status" className="rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm text-rose-200">{message}</p>}
      <button type="submit" disabled={pending} className="button-primary w-full">{pending ? "Actualizando contraseña…" : "Cambiar contraseña"}</button>
    </form>
  );
}
