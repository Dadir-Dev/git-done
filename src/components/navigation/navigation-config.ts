import type { LucideIcon } from "lucide-react";
import { FolderKanban, LayoutDashboard } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: "exact" | "segment";
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: "exact",
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    match: "segment",
  },
];