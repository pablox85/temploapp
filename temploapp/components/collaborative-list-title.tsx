"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCollaborativeListTitleAction } from "@/app/(dashboard)/dashboard/items/actions";
import { ResetIcon, SaveCheckIcon, SaveIcon } from "@/components/icons";

export function CollaborativeListTitle({ initialTitle, isAdmin }: { initialTitle: string; isAdmin: boolean }) {
  const router = useRouter();
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [draftTitle, setDraftTitle] = useState(initialTitle);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isSaved = Boolean(savedTitle) && draftTitle.trim() === savedTitle;
  const canReset = Boolean(savedTitle) || Boolean(draftTitle.trim());

  function saveTitle() {
    persistTitle(draftTitle);
  }

  function resetTitle() {
    persistTitle("");
  }

  function persistTitle(title: string) {
    setErrorMessage("");
    startTransition(async () => {
      const result = await updateCollaborativeListTitleAction(title);
      if (result.status === "error") {
        setErrorMessage(result.message);
        return;
      }

      const nextTitle = result.title ?? "";
      setSavedTitle(nextTitle);
      setDraftTitle(nextTitle);
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          value={draftTitle}
          onChange={(event) => {
            setDraftTitle(event.currentTarget.value);
            setErrorMessage("");
          }}
          readOnly={!isAdmin}
          disabled={isPending}
          maxLength={80}
          className="input min-w-0 flex-1 text-base font-semibold read-only:cursor-default read-only:bg-slate-50 dark:read-only:bg-slate-900"
          aria-label="Título de la lista colaborativa"
          placeholder="Título de la lista…"
        />
        {isAdmin && (
          <button
            type="button"
            onClick={saveTitle}
            disabled={isPending}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 transition duration-200 hover:bg-teal-100 focus-visible:ring-4 focus-visible:ring-teal-500/20 focus-visible:outline-none active:scale-[.98] dark:bg-teal-400/10 dark:text-teal-300 dark:hover:bg-teal-400/15"
            aria-label={isSaved ? "Título de la lista guardado" : "Guardar título de la lista"}
            title={isSaved ? "Título guardado" : "Guardar"}
          >
            {isSaved ? <SaveCheckIcon className="size-5" /> : <SaveIcon className="size-5" />}
          </button>
        )}
        {isAdmin && canReset && (
          <button
            type="button"
            onClick={resetTitle}
            disabled={isPending}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition duration-200 hover:bg-slate-200 focus-visible:ring-4 focus-visible:ring-slate-400/20 focus-visible:outline-none active:scale-[.98] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Restablecer título de la lista"
            title="Restablecer título"
          >
            <ResetIcon className="size-5" />
          </button>
        )}
      </div>
      {errorMessage && <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{errorMessage}</p>}
    </div>
  );
}
