"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import type { Role } from "@/lib/types";

export default function Topbar({
  role,
  userName,
  userTitle,
  avatarColor,
  notifCount,
  onMenuClick,
}: {
  role: Role;
  userName: string;
  userTitle?: string;
  avatarColor: string;
  notifCount: number;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-inkmuted md:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <span className="text-sm text-inkmuted capitalize">{role} workspace</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href={`/${role}/notifications`}
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-line text-inkmuted transition-colors hover:border-brand hover:text-brand"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] font-semibold text-white">
              {notifCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md border border-line py-1 pl-1 pr-2 hover:border-brand"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium leading-tight text-ink">{userName}</span>
              {userTitle && (
                <span className="block text-[11px] leading-tight text-inkmuted">{userTitle}</span>
              )}
            </span>
            <ChevronDown size={14} className="text-inkmuted" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-44 rounded-md border border-line bg-surface py-1 shadow-lg">
                <Link
                  href={`/${role}/profile`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-ink hover:bg-surface2"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-clay hover:bg-surface2"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
