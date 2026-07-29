"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { markItemsNotificationsSeenAction } from "@/app/(dashboard)/dashboard/items/actions";
import { BellIcon } from "@/components/icons";

export function ItemNotifications({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const acknowledgementStarted = useRef(false);
  const [acknowledgedCount, setAcknowledgedCount] = useState<number | null>(null);

  useEffect(() => {
    if (pathname !== "/dashboard/items" || acknowledgementStarted.current) return;
    acknowledgementStarted.current = true;

    void markItemsNotificationsSeenAction().then((result) => {
      if (result.status === "success") {
        // The dashboard layout can retain its previous server payload during
        // client navigation. Hide this already-acknowledged notification while
        // router.refresh obtains the updated unread count.
        setAcknowledgedCount(unreadCount);
        router.refresh();
      }
      else acknowledgementStarted.current = false;
    });
  }, [pathname, router, unreadCount]);

  if (unreadCount === 0 || pathname === "/dashboard/items" || acknowledgedCount === unreadCount) return null;

  return (
    <Link
      href="/dashboard/items"
      className="fixed bottom-5 left-5 right-32 z-40 flex items-center gap-3 rounded-2xl border border-teal-400/30 bg-slate-950 px-4 py-3 text-white shadow-xl shadow-slate-950/30 transition hover:-translate-y-0.5 hover:border-teal-400/60 sm:inset-x-auto sm:top-5 sm:right-5 sm:bottom-auto sm:max-w-sm dark:bg-slate-900"
      aria-label={`${unreadCount} ${unreadCount === 1 ? "ítem nuevo" : "ítems nuevos"}. Ver lista de ítems.`}
    >
      <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-teal-500/15 text-teal-300"><BellIcon className="size-5" /><span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-slate-950">{unreadCount > 99 ? "99+" : unreadCount}</span></span>
      <span><span className="block text-sm font-semibold">{unreadCount === 1 ? "Hay un ítem nuevo" : `Hay ${unreadCount} ítems nuevos`}</span><span className="mt-0.5 block text-xs text-slate-400">Ver lista colaborativa</span></span>
    </Link>
  );
}
