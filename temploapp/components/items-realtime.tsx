"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ItemsRealtimeProps = {
  tenantId: string;
};

export function ItemsRealtime({ tenantId }: ItemsRealtimeProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`items:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_items",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Error en Supabase Realtime:", error);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, tenantId]);

  return null;
}