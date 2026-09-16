"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Role } from "@/lib/types";

export default function DashboardChrome({
  role,
  userName,
  userTitle,
  avatarColor,
  notifCount,
  children,
}: {
  role: Role;
  userName: string;
  userTitle?: string;
  avatarColor: string;
  notifCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role={role} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          userName={userName}
          userTitle={userTitle}
          avatarColor={avatarColor}
          notifCount={notifCount}
          onMenuClick={() => setOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
