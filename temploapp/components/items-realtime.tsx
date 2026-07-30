"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { rememberNewItem } from "@/lib/items/new-item";
import { createClient } from "@/lib/supabase/client";

type ItemsRealtimeProps = {
  tenantId: string;
};

type RealtimeTable = "items" | "user_items" | "profiles" | "tenants";

export function ItemsRealtime({ tenantId }: ItemsRealtimeProps) {
  const router = useRouter();

  useEffect(() => {
    console.info("[Realtime] ItemsRealtime montado", { tenantId });

    const supabase = createClient();
    console.info("[Realtime] Cliente creado", { tenantId });

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const scheduleRefresh = (
      table: RealtimeTable,
      eventType: string,
      payload: unknown,
    ) => {
      console.info("[Realtime] postgres_changes recibido", {
        tenantId,
        table,
        eventType,
        payload,
      });

      if (refreshTimer !== null) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        console.info("[Realtime] Ejecutando router.refresh()", {
          tenantId,
          table,
          eventType,
        });
        router.refresh();
      }, 200);
    };

    const subscribe = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.info("[Realtime] Sesión del cliente", {
        hasSession: session !== null,
        userId: session?.user.id ?? null,
        expiresAt: session?.expires_at ?? null,
      });

      if (cancelled) return;

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      if (cancelled) return;

      const tenantFilter = `tenant_id=eq.${tenantId}`;

      channel = supabase
        .channel(`items:${tenantId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_items",
            filter: tenantFilter,
          },
          (payload) => {
            scheduleRefresh("user_items", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_items",
            filter: tenantFilter,
          },
          (payload) => {
            scheduleRefresh("user_items", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "user_items",
          },
          (payload) => {
            scheduleRefresh("user_items", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "items",
            filter: tenantFilter,
          },
          (payload) => {
            if (typeof payload.new.id === "string") {
              rememberNewItem(payload.new.id);
            }
            scheduleRefresh("items", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "items",
            filter: tenantFilter,
          },
          (payload) => {
            scheduleRefresh("items", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "items",
          },
          (payload) => {
            scheduleRefresh("items", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: tenantFilter,
          },
          (payload) => {
            scheduleRefresh("profiles", payload.eventType, payload);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "tenants",
            filter: `id=eq.${tenantId}`,
          },
          (payload) => {
            scheduleRefresh("tenants", payload.eventType, payload);
          },
        )
        .subscribe((status, error) => {
          console.info("[Realtime] Estado de subscribe", {
            tenantId,
            status,
            error,
          });
        });
    };

    void subscribe();

    return () => {
      cancelled = true;
      if (refreshTimer !== null) clearTimeout(refreshTimer);
      if (channel === null) return;

      console.info("[Realtime] Ejecutando removeChannel", { tenantId });
      void supabase.removeChannel(channel).then((status) => {
        console.info("[Realtime] Resultado de removeChannel", {
          tenantId,
          status,
        });
      });
    };
  }, [router, tenantId]);

  return null;
}
