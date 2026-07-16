"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type AdminTab = "items" | "users";

export function AdminTabs({ itemsContent, usersContent }: { itemsContent: ReactNode; usersContent: ReactNode }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("items");

  return (
    <div className="mt-9">
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900" role="tablist" aria-label="Secciones de administración">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "items"}
          aria-controls="admin-items-panel"
          onClick={() => setActiveTab("items")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 ${activeTab === "items" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
        >
          Ítems
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "users"}
          aria-controls="admin-users-panel"
          onClick={() => setActiveTab("users")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 ${activeTab === "users" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
        >
          Usuarios
        </button>
      </div>

      <div id="admin-items-panel" role="tabpanel" aria-label="Administrar ítems" hidden={activeTab !== "items"}>
        {itemsContent}
      </div>
      <div id="admin-users-panel" role="tabpanel" aria-label="Usuarios y asignaciones" hidden={activeTab !== "users"}>
        {usersContent}
      </div>
    </div>
  );
}
