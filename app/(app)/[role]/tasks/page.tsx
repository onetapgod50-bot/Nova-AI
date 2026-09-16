import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getTasksForSupervisor, getProjectById } from "@/lib/data";
import Badge from "@/components/Badge";
import ProgressBar from "@/components/ProgressBar";
import EmptyState from "@/components/EmptyState";

export default async function MyTasksPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "supervisor") redirect(`/${session.role}/projects`);

  const tasks = getTasksForSupervisor(session.userId).sort((a, b) => {
    const order = { in_progress: 0, delayed: 0, not_started: 1, on_hold: 1, completed: 2 } as const;
    return (order[a.status] ?? 1) - (order[b.status] ?? 1) || a.deadline.localeCompare(b.deadline);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">My Tasks</h1>
        <p className="mt-1 text-sm text-inkmuted">Everything assigned to you, across every project.</p>
      </div>

      <div className="space-y-2">
        {tasks.map((t) => {
          const project = getProjectById(t.projectId);
          return (
            <Link
              key={t.id}
              href={`/supervisor/tasks/${t.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface p-4 hover:border-brand"
            >
              <div>
                <div className="text-sm font-medium text-ink">{t.name}</div>
                <div className="text-xs text-inkmuted">{project?.name} · due {t.deadline || "—"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-28"><ProgressBar value={t.progress} size="sm" tone={t.status === "delayed" ? "amber" : "brand"} /></div>
                <span className="w-9 text-right font-mono text-xs text-inkmuted">{t.progress}%</span>
                <Badge value={t.status} />
              </div>
            </Link>
          );
        })}
        {tasks.length === 0 && <EmptyState text="No tasks assigned to you yet." />}
      </div>
    </div>
  );
}
