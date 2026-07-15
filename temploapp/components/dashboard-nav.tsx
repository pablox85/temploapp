"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, GridIcon, ListIcon, PlusIcon, ShieldIcon } from "@/components/icons";

const links = [
  { href: "/dashboard", label: "Resumen", icon: GridIcon, exact: true },
  { href: "/dashboard/items", label: "Lista de ítems", icon: ListIcon, exact: true },
  { href: "/dashboard/items/new", label: "Agregar ítem", icon: PlusIcon },
  { href: "/dashboard/my-items", label: "Mis ítems", icon: CheckIcon },
];

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const allLinks = isAdmin ? [...links, { href: "/dashboard/admin", label: "Panel admin", icon: ShieldIcon, exact: true }, { href: "/dashboard/admin/users", label: "Usuarios", icon: ShieldIcon, exact: true }] : links;

  return (
    <nav aria-label="Navegación principal" className="flex min-w-max gap-1 lg:block lg:min-w-0 lg:space-y-1">
      {allLinks.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`nav-link ${active ? "nav-link-active" : ""}`}>
            <Icon className="size-5" />{label}
          </Link>
        );
      })}
    </nav>
  );
}
