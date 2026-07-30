"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckIcon,
  ChecklistIcon,
  GridIcon,
  InventoryIcon,
  ListIcon,
  NotesIcon,
  PlusIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/icons";
import type { ExtraListType } from "@/lib/types/database";

export type DashboardExtraList = {
  id: string;
  name: string;
  listType: ExtraListType;
};

const extraListAppearance = {
  checklist: {
    icon: ChecklistIcon,
    className: "text-teal-600 dark:text-teal-300",
  },
  inventory: {
    icon: InventoryIcon,
    className: "text-amber-600 dark:text-amber-300",
  },
  notes: {
    icon: NotesIcon,
    className: "text-violet-600 dark:text-violet-300",
  },
} satisfies Record<ExtraListType, {
  icon: typeof ListIcon;
  className: string;
}>;

const links = [
  { href: "/dashboard/items", label: "Lista de ítems", icon: ListIcon, exact: true },
  { href: "/dashboard/items/new", label: "Agregar ítem", icon: PlusIcon },
  { href: "/dashboard/my-items", label: "Mis ítems", icon: CheckIcon },
];

function getLinks(isAdmin: boolean) {
  return isAdmin ? [...links, { href: "/dashboard/admin", label: "Administracion", icon: ShieldIcon, exact: true }, { href: "/dashboard/admin/users", label: "Usuarios", icon: UsersIcon, exact: true }] : links;
}

export function DashboardNav({
  isAdmin,
  extraLists = [],
  mobile = false,
  onNavigate,
}: {
  isAdmin: boolean;
  extraLists?: DashboardExtraList[];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const allLinks = getLinks(isAdmin);

  return (
    <nav aria-label="Navegación principal" className={mobile ? "space-y-1" : "flex min-w-max gap-1 lg:block lg:min-w-0 lg:space-y-1"}>
      {allLinks.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} onClick={onNavigate} className={`nav-link ${mobile ? "w-full" : ""} ${active ? "nav-link-active" : ""}`}>
            <Icon className="size-5" />{label}
          </Link>
        );
      })}
      {isAdmin && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Listas extra
          </p>
          <Link
            href="/dashboard/extras"
            onClick={onNavigate}
            className={`nav-link ${mobile ? "w-full" : ""} ${pathname === "/dashboard/extras" ? "nav-link-active" : ""}`}
          >
            <SparklesIcon className="size-5" />
            Administrar listas
          </Link>
          {extraLists.map((list) => {
            const href = `/dashboard/extras/${encodeURIComponent(list.name)}`;
            const active = pathname === href || pathname === `/dashboard/extras/${list.name}`;
            const { icon: ExtraListIcon, className: iconClassName } = extraListAppearance[list.listType];

            return (
              <Link
                key={list.id}
                href={href}
                onClick={onNavigate}
                title={list.name}
                className={`nav-link ${mobile ? "w-full" : ""} ${active ? "nav-link-active" : ""}`}
              >
                <ExtraListIcon className={`size-5 shrink-0 ${iconClassName}`} />
                <span className="truncate">{list.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

export function DashboardQuickLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const quickLinks = [
    { href: "/dashboard", label: "Panel", icon: GridIcon, exact: true },
    links[0],
    links[2],
    ...(isAdmin
      ? [{ href: "/dashboard/extras", label: "Administrar listas", icon: SparklesIcon, exact: true }]
      : []),
  ];
  return (
    <nav aria-label="Accesos directos" className="flex items-start gap-1">
      {quickLinks.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const shortLabel = href === "/dashboard"
          ? "Panel"
          : href === "/dashboard/items"
            ? "Lista"
            : href === "/dashboard/extras"
              ? "Listas"
              : "Mis ítems";
        return (
          <div key={href} className="flex min-w-11 flex-col items-center gap-0.5">
            <Link
              href={href}
              className={`mobile-nav-control size-11 ${active ? "mobile-nav-control-active" : ""}`}
              aria-label={label}
              title={label}
            >
              <Icon className="size-5" />
            </Link>
            <span className={`whitespace-nowrap text-[10px] font-medium leading-3 ${active ? "text-teal-700 dark:text-teal-300" : "text-slate-500 dark:text-slate-400"}`} aria-hidden="true">{shortLabel}</span>
          </div>
        );
      })}
    </nav>
  );
}
