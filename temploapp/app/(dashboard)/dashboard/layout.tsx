import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { LogOutIcon } from "@/components/icons";
import { signOutAction } from "@/app/(auth)/login/actions";
import { requireProfile } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const initials = profile.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-slate-200 bg-white px-5 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:px-2"><Brand /><div className="flex items-center gap-2"><span className="badge bg-teal-50 text-teal-700 lg:hidden">{profile.role}</span><ThemeToggle /></div></div>
        <div className="mt-5 overflow-x-auto pb-1 lg:mt-10 lg:overflow-visible"><DashboardNav isAdmin={profile.role === "admin"} /></div>
        <div className="mt-auto hidden border-t border-slate-100 pt-5 lg:block">
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">{initials}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{profile.full_name}</p><p className="text-xs capitalize text-slate-500">{profile.role}</p></div>
            <form action={signOutAction}><button className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar sesión"><LogOutIcon className="size-5" /></button></form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 xl:p-10">{children}</main>
    </div>
  );
}
