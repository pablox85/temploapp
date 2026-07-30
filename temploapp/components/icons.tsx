import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const TempleIcon = (props: IconProps) => <Icon {...props}><path d="M3 21h18M5 18h14M6 9h12M4 9l8-6 8 6M7 9v9m5-9v9m5-9v9" /></Icon>;
export const GridIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Icon>;
export const ListIcon = (props: IconProps) => <Icon {...props}><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></Icon>;
export const ChecklistIcon = (props: IconProps) => <Icon {...props}><path d="m3 6 1.5 1.5L7 5M10 6h11M3 12h4M10 12h11M3 18h4M10 18h11" /></Icon>;
export const InventoryIcon = (props: IconProps) => <Icon {...props}><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></Icon>;
export const NotesIcon = (props: IconProps) => <Icon {...props}><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M8 12h7M8 16h7" /></Icon>;
export const CheckIcon = (props: IconProps) => <Icon {...props}><path d="m5 12 4 4L19 6" /></Icon>;
export const PlusIcon = (props: IconProps) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>;
export const UsersIcon = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
export const ShieldIcon = (props: IconProps) => <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></Icon>;
export const LogOutIcon = (props: IconProps) => <Icon {...props}><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></Icon>;
export const SearchIcon = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon>;
export const SortAscendingIcon = (props: IconProps) => <Icon {...props}><path d="M4 6h7M4 12h5M4 18h3M17 19V5M13 9l4-4 4 4" /></Icon>;
export const SortDescendingIcon = (props: IconProps) => <Icon {...props}><path d="M4 6h3M4 12h5M4 18h7M17 5v14M13 15l4 4 4-4" /></Icon>;
export const TrashIcon = (props: IconProps) => <Icon {...props}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></Icon>;
export const SparklesIcon = (props: IconProps) => <Icon {...props}><path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4L12 3ZM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 14l-.8 2.2L16 17l2.2.8L19 20l.8-2.2L22 17l-2.2-.8L19 14Z" /></Icon>;
export const EyeIcon = (props: IconProps) => <Icon {...props}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></Icon>;
export const EyeOffIcon = (props: IconProps) => <Icon {...props}><path d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16.8 16.8 0 0 1-3.1 3.7M6.5 6.9C3.8 8.5 2.5 12 2.5 12s3.5 6 9.5 6c.7 0 1.4-.1 2-.2M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Icon>;
export const SunIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></Icon>;
export const MoonIcon = (props: IconProps) => <Icon {...props}><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z" /></Icon>;
export const MenuIcon = (props: IconProps) => <Icon {...props}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
export const CloseIcon = (props: IconProps) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const ArrowLeftIcon = (props: IconProps) => <Icon {...props}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;
export const BellIcon = (props: IconProps) => <Icon {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Icon>;
export const SaveIcon = (props: IconProps) => <Icon {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></Icon>;
export const SaveCheckIcon = (props: IconProps) => <Icon {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M7 3v5h8M7 21v-8h4M14 17l2 2 4-4" /></Icon>;
export const ResetIcon = (props: IconProps) => <Icon {...props}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Icon>;
