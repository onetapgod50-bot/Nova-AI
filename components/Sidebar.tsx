"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  Boxes,
  ClipboardCheck,
  BarChart3,
  Bot,
  Bell,
  UserCircle,
  HardHat,
  X,
} from "lucide-react";
import type { Role } from "@/lib/types";

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard };

const NAV: Record<Role, NavItem[]> = {
  engineer: [
    { label: "Dashboard", href: "/engineer/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/engineer/projects", icon: FolderKanban },
    { label: "Create Project", href: "/engineer/projects/new", icon: FilePlus2 },
    { label: "Reports", href: "/engineer/reports", icon: BarChart3 },
    { label: "BuildNova AI", href: "/engineer/ai", icon: Bot },
    { label: "Notifications", href: "/engineer/notifications", icon: Bell },
    { label: "Profile", href: "/engineer/profile", icon: UserCircle },
  ],
  manager: [
    { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/manager/projects", icon: FolderKanban },
    { label: "Resource Requests", href: "/manager/resource-requests", icon: Boxes },
    { label: "Reports", href: "/manager/reports", icon: BarChart3 },
    { label: "BuildNova AI", href: "/manager/ai", icon: Bot },
    { label: "Notifications", href: "/manager/notifications", icon: Bell },
    { label: "Profile", href: "/manager/profile", icon: UserCircle },
  ],
  supervisor: [
    { label: "Dashboard", href: "/supervisor/dashboard", icon: LayoutDashboard },
    { label: "My Projects", href: "/supervisor/projects", icon: FolderKanban },
    { label: "My Tasks", href: "/supervisor/tasks", icon: ClipboardCheck },
    { label: "My Resources", href: "/supervisor/resources", icon: Boxes },
    { label: "Reports", href: "/supervisor/reports", icon: BarChart3 },
    { label: "BuildNova AI", href: "/supervisor/ai", icon: Bot },
    { label: "Notifications", href: "/supervisor/notifications", icon: Bell },
    { label: "Profile", href: "/supervisor/profile", icon: UserCircle },
  ],
};

export default function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = NAV[role];

  const content = (
    <div className="flex h-full w-64 flex-col border-r border-line bg-surface">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
            <HardHat size={16} strokeWidth={2} />
          </span>
          <span className="font-mono text-[15px] font-semibold tracking-tight text-ink">
            BuildNova
          </span>
        </Link>
        <button onClick={onClose} className="text-inkmuted md:hidden" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 scrollbar-thin">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-brand-soft text-brand font-medium"
                  : "text-inkmuted hover:bg-surface2 hover:text-ink"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.25 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-5 py-4 text-xs text-inkmuted">
        Signed in as <span className="font-medium capitalize text-ink">{role}</span>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0">{content}</div>
        </div>
      )}
    </>
  );
}
