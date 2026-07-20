"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, GridIcon, ListIcon, PlusIcon, ShieldIcon, UsersIcon } from "@/components/icons";
import { CreateItemModalTrigger } from "@/components/create-item-modal";

const links = [
  { href: "/dashboard/items", label: "Lista de ítems", icon: ListIcon, exact: true },
  { href: "/dashboard/items/new", label: "Agregar ítem", icon: PlusIcon },
  { href: "/dashboard/my-items", label: "Mis ítems", icon: CheckIcon },
];

function getLinks(isAdmin: boolean) {
  return isAdmin ? [...links, { href: "/dashboard/admin", label: "Panel admin", icon: ShieldIcon, exact: true }, { href: "/dashboard/admin/users", label: "Usuarios", icon: UsersIcon, exact: true }] : links;
}

export function DashboardNav({ isAdmin, mobile = false, onNavigate }: { isAdmin: boolean; mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const allLinks = getLinks(isAdmin);

  return (
    <nav aria-label="Navegación principal" className={mobile ? "space-y-1" : "flex min-w-max gap-1 lg:block lg:min-w-0 lg:space-y-1"}>
      {allLinks.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        if (href === "/dashboard/items/new" && pathname !== "/dashboard" && pathname !== "/dashboard/items/new") {
          return <CreateItemModalTrigger key={href} label={label} className={`nav-link ${mobile ? "w-full" : ""}`} />;
        }
        return (
          <Link key={href} href={href} onClick={onNavigate} className={`nav-link ${mobile ? "w-full" : ""} ${active ? "nav-link-active" : ""}`}>
            <Icon className="size-5" />{label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardQuickLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const quickLinks = [{ href: "/dashboard", label: "Panel", icon: GridIcon, exact: true }, ...getLinks(isAdmin)];
  return (
    <nav aria-label="Accesos directos" className="flex items-start gap-1">
      {quickLinks.filter(({ href }) => href !== "/dashboard/items/new").map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const shortLabel = href === "/dashboard" ? "Panel" : href === "/dashboard/items" ? "Lista" : href === "/dashboard/my-items" ? "Mis ítems" : href === "/dashboard/admin" ? "Admin" : "Usuarios";
        return (
          <div key={href} className="flex min-w-9 flex-col items-center gap-0.5">
            <Link
              href={href}
              className={`grid size-9 place-items-center rounded-lg border transition ${active ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-400/10 dark:text-teal-300" : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              aria-label={label}
              title={label}
            >
              <Icon className="size-4" />
            </Link>
            <span className={`whitespace-nowrap text-[9px] font-medium leading-3 ${active ? "text-teal-700 dark:text-teal-300" : "text-slate-500 dark:text-slate-400"}`} aria-hidden="true">{shortLabel}</span>
          </div>
        );
      })}
    </nav>
  );
}
