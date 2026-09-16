import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getTaskById, getProjectById, getSitePhotosForProject } from "@/lib/data";
import Badge from "@/components/Badge";
import TaskUpdatePanel from "@/components/project/TaskUpdatePanel";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ role: string; id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "supervisor") redirect(`/${session.role}/projects`);

  const task = getTaskById(id);
  if (!task) notFound();
  if (task.supervisorId !== session.userId) redirect("/supervisor/tasks");

  const project = getProjectById(task.projectId);
  const photos = getSitePhotosForProject(task.projectId).filter((p) => p.taskId === task.id);

  return (
    <div className="space-y-6">
      <Link href="/supervisor/tasks" className="flex items-center gap-1.5 text-xs text-inkmuted hover:text-brand">
        <ArrowLeft size={13} /> Back to My Tasks
      </Link>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-ink">{task.name}</h1>
            <p className="text-xs text-inkmuted">{project?.name} · due {task.deadline || "—"}</p>
          </div>
          <Badge value={task.status} />
        </div>
        <p className="mt-3 text-sm text-inkmuted">{task.description}</p>
      </div>

      <TaskUpdatePanel task={task} initialPhotos={photos} />
    </div>
  );
}
