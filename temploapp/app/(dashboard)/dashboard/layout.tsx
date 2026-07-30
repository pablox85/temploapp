import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { LogOutIcon } from "@/components/icons";
import { signOutAction } from "@/app/(auth)/login/actions";
import { requireProfile } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileDashboardMenu } from "@/components/mobile-dashboard-menu";
import { ItemNotifications } from "@/components/item-notifications";
import { ItemsRealtime } from "@/components/items-realtime";
import { getUnreadItemsNotification } from "@/lib/services/items";
import { getExtraLists } from "@/lib/services/extra-lists";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const tenantName = profile.tenants?.name?.trim();
  const displayName = tenantName
    ? `${profile.full_name} · ${tenantName}`
    : profile.full_name;
  const [unreadItems, extraLists] = await Promise.all([
    getUnreadItemsNotification(profile.items_last_seen_at),
    profile.role === "admin" ? getExtraLists() : Promise.resolve([]),
  ]);
  const dashboardExtraLists = extraLists.map(({ id, name, list_type }) => ({
    id,
    name,
    listType: list_type,
  }));

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-b border-slate-200 bg-white px-5 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <div className="flex items-start justify-between gap-3 lg:px-2">
          <div className="min-w-0">
            <Brand />
            <p className="mt-1 ml-13 truncate text-xs font-medium text-slate-500 dark:text-slate-400" title={displayName}>{displayName}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-5 min-h-0 overflow-x-auto pb-1 lg:mt-10 lg:flex-1 lg:overflow-x-hidden lg:overflow-y-auto">
          <DashboardNav isAdmin={profile.role === "admin"} extraLists={dashboardExtraLists} />
        </div>
        <div className="mt-auto hidden border-t border-slate-100 pt-5 lg:block dark:border-slate-800">
          <form action={signOutAction}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Salir"><LogOutIcon className="size-5" />Salir</button></form>
        </div>
      </aside>
      <MobileDashboardMenu isAdmin={profile.role === "admin"} fullName={displayName} extraLists={dashboardExtraLists}>
        <form action={signOutAction}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Salir"><LogOutIcon className="size-5" />Salir</button></form>
      </MobileDashboardMenu>
      <main className="min-w-0 p-5 sm:p-8 xl:p-10">{children}</main>
      <ItemsRealtime tenantId={profile.tenant_id} />
      <ItemNotifications unreadCount={unreadItems.count} unreadVersion={unreadItems.version} />
    </div>
  );
}
