"use client";

import { useState, useTransition } from "react";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  deleteAdminUserAction,
  type DeleteAdminUserResult,
} from "@/lib/auth/admin-users";

export function DeleteUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<DeleteAdminUserResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    if (pending) return;

    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (pending) return;

    setResult(null);
    setConfirmOpen(false);
    startTransition(async () => {
      setResult(await deleteAdminUserAction(userId));
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        className="button-danger min-h-9 px-3 py-2"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Eliminando…" : "Eliminar usuario"}
      </button>
      {result?.message && (
        <p
          aria-live="polite"
          role="status"
          className={`mt-2 text-sm ${result.success ? "text-teal-700 dark:text-teal-300" : "text-rose-700 dark:text-rose-300"}`}
        >
          {result.message}
        </p>
      )}
      <ConfirmationModal
        open={confirmOpen}
        message={`¿Eliminar definitivamente a “${userName}”? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        confirmClassName="button-danger"
        confirmLabel="Eliminar usuario"
      />
    </div>
  );
}
