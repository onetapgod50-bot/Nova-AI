"use client";

import { useState } from "react";
import { BellRing, CheckCheck, AlertTriangle, ClipboardCheck, Boxes, Milestone } from "lucide-react";
import type { Notification } from "@/lib/types";
import EmptyState from "@/components/EmptyState";

const ICONS: Record<Notification["type"], typeof BellRing> = {
  progress: ClipboardCheck,
  task: ClipboardCheck,
  resource: Boxes,
  milestone: Milestone,
  delay: AlertTriangle,
  system: BellRing,
};

export default function NotificationsList({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);

  async function markRead(id: string) {
    setNotifications((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PUT" })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-md border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="text-sm text-inkmuted">{unreadCount} unread</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
            <CheckCheck size={13} /> Mark all as read
          </button>
        )}
      </div>
      <div className="divide-y divide-line">
        {notifications.map((n) => {
          const Icon = ICONS[n.type];
          return (
            <button
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                n.read ? "" : "bg-brand-soft/40"
              } hover:bg-surface2`}
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-surface2 text-inkmuted" : "bg-brand-soft text-brand"}`}>
                <Icon size={13} />
              </span>
              <span className="flex-1">
                <span className={`block text-sm ${n.read ? "text-inkmuted" : "font-medium text-ink"}`}>{n.message}</span>
                <span className="mt-0.5 block font-mono text-xs text-inkmuted">{n.createdAt}</span>
              </span>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
            </button>
          );
        })}
        {notifications.length === 0 && (
          <div className="px-5 py-8">
            <EmptyState text="No notifications yet." />
          </div>
        )}
      </div>
    </div>
  );
}
