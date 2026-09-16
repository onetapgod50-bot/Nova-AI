import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";
import { Mail, Shield, UserCircle } from "lucide-react";

const PERMISSIONS: Record<string, string[]> = {
  engineer: [
    "Create and plan projects",
    "Upload and manage blueprints",
    "View planning info and overall project status",
    "Ask BuildNova AI about your own projects",
  ],
  manager: [
    "Divide projects into tasks and assign supervisors",
    "Allocate resources and respond to resource requests",
    "Monitor site progress and photos",
    "Ask BuildNova AI about your assigned projects",
  ],
  supervisor: [
    "Update progress on your assigned tasks",
    "Upload site photos and submit completion reports",
    "Request additional resources",
    "Ask BuildNova AI about your own tasks and resources",
  ],
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;
  const user = getUserById(session.userId);
  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">Profile</h1>

      <div className="rounded-md border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {initials}
          </span>
          <div>
            <div className="text-base font-semibold text-ink">{user.name}</div>
            <div className="text-sm text-inkmuted">{user.title}</div>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
          <div className="flex items-center gap-2 text-inkmuted">
            <Mail size={14} /> {user.email}
          </div>
          <div className="flex items-center gap-2 text-inkmuted">
            <UserCircle size={14} /> <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Shield size={15} className="text-brand" /> What you can do
        </div>
        <ul className="mt-3 space-y-2 text-sm text-inkmuted">
          {PERMISSIONS[user.role].map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-brand">·</span> {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
