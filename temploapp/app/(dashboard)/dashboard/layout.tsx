import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { LogOutIcon } from "@/components/icons";
import { signOutAction } from "@/app/(auth)/login/actions";
import { requireProfile } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileDashboardMenu } from "@/components/mobile-dashboard-menu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-b border-slate-200 bg-white px-5 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <div className="flex items-start justify-between gap-3 lg:px-2">
          <div className="min-w-0">
            <Brand />
            <p className="mt-1 ml-[52px] truncate text-xs font-medium text-slate-500 dark:text-slate-400" title={profile.full_name}>{profile.full_name}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-5 overflow-x-auto pb-1 lg:mt-10 lg:overflow-visible"><DashboardNav isAdmin={profile.role === "admin"} /></div>
        <div className="mt-auto hidden border-t border-slate-100 pt-5 lg:block dark:border-slate-800">
          <form action={signOutAction}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Salir"><LogOutIcon className="size-5" />Salir</button></form>
        </div>
      </aside>
      <MobileDashboardMenu isAdmin={profile.role === "admin"} fullName={profile.full_name}>
        <form action={signOutAction}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Salir"><LogOutIcon className="size-5" />Salir</button></form>
      </MobileDashboardMenu>
      <main className="min-w-0 p-5 sm:p-8 xl:p-10">{children}</main>
    </div>
  );
}
