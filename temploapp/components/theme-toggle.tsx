"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

const themeEvent = "temploapp-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(themeEvent, callback);
  return () => window.removeEventListener(themeEvent, callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("temploapp-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(themeEvent));
  }

  return <button type="button" onClick={toggleTheme} className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"} title={dark ? "Modo claro" : "Modo oscuro"}>
    {dark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
  </button>;
}
