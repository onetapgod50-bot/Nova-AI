import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, DollarSign, Users, ClipboardList, AlertTriangle, Camera } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getProjectById,
  getBlueprintForProject,
  getTasksForProject,
  getResourcesForProject,
  getResourceRequests,
  getProgressReportsForProject,
  getSitePhotosForProject,
  getUsersByRole,
  getUserById,
} from "@/lib/data";
import Badge from "@/components/Badge";
import ProgressBar from "@/components/ProgressBar";
import ProgressDonut from "@/components/charts/ProgressDonut";
import BlueprintEditor from "@/components/project/BlueprintEditor";
import TaskBoard from "@/components/project/TaskBoard";
import ResourcePanel from "@/components/project/ResourcePanel";
import EmptyState from "@/components/EmptyState";
import type { Session } from "@/lib/session";
import type { Task } from "@/lib/types";

function canAccess(session: Session, project: NonNullable<ReturnType<typeof getProjectById>>, tasks: Task[]) {
  if (session.role === "engineer") return project.engineerId === session.userId;
  if (session.role === "manager") return !project.managerId || project.managerId === session.userId;
  return tasks.some((t) => t.supervisorId === session.userId);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ role: string; id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  const project = getProjectById(id);
  if (!project) notFound();

  const tasks = getTasksForProject(id);
  if (!canAccess(session, project, tasks)) redirect(`/${session.role}/projects`);

  const blueprint = getBlueprintForProject(id);
  const resources = getResourcesForProject(id);
  const requests = getResourceRequests({ projectId: id });
  const reports = getProgressReportsForProject(id).slice(-6).reverse();
  const photos = getSitePhotosForProject(id);
  const supervisors = getUsersByRole("supervisor");

  const visibleTasks =
    session.role === "supervisor" ? tasks.filter((t) => t.supervisorId === session.userId) : tasks;

  return (
    <div className="space-y-8">
      <ProjectHeader project={project} />

      {session.role === "engineer" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <BlueprintEditor projectId={project.id} blueprint={blueprint} />
          <ProjectStatusCard project={project} tasks={tasks} />
        </div>
      )}

      {session.role === "engineer" && (
        <TaskReadOnlyList tasks={tasks} title="Tasks (managed by your project manager)" />
      )}

      {session.role === "manager" && (
        <>
          <TaskBoard projectId={project.id} tasks={tasks} supervisors={supervisors} />
          <ResourcePanel projectId={project.id} tasks={tasks} resources={resources} />
          <div className="grid gap-5 lg:grid-cols-2">
            <RecentReportsCard reports={reports} />
            <PhotoGallery photos={photos} />
          </div>
          {requests.length > 0 && <ProjectRequestsCard requests={requests} />}
        </>
      )}

      {session.role === "supervisor" && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-ink">Your tasks on this project</div>
          {visibleTasks.map((t) => (
            <Link
              key={t.id}
              href={`/supervisor/tasks/${t.id}`}
              className="flex items-center justify-between rounded-md border border-line bg-surface p-4 hover:border-brand"
            >
              <div>
                <div className="text-sm font-medium text-ink">{t.name}</div>
                <div className="text-xs text-inkmuted">Due {t.deadline || "—"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24"><ProgressBar value={t.progress} size="sm" /></div>
                <Badge value={t.status} />
              </div>
            </Link>
          ))}
          {visibleTasks.length === 0 && <EmptyState text="No tasks assigned to you on this project." />}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function ProjectHeader({ project }: { project: NonNullable<ReturnType<typeof getProjectById>> }) {
  return (
    <div className="rounded-md border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
            <Badge value={project.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-inkmuted">
            <span className="flex items-center gap-1"><MapPin size={12} /> {project.location}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {project.startDate} → {project.expectedCompletion}</span>
            <span className="flex items-center gap-1"><DollarSign size={12} /> ${project.budget.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {project.requiredWorkers} workers</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-inkmuted">{project.description}</p>
        </div>
        <div className="shrink-0">
          <ProgressDonut value={project.overallProgress} size={92} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ProjectStatusCard({
  project,
  tasks,
}: {
  project: NonNullable<ReturnType<typeof getProjectById>>;
  tasks: Task[];
}) {
  const delayed = tasks.filter((t) => t.status === "delayed").length;
  const currentStage = tasks.find((t) => t.status === "in_progress")?.name || tasks.find((t) => t.status === "not_started")?.name || "—";

  const rows: { label: string; value: string }[] = [
    { label: "Planning status", value: "Submitted" },
    { label: "Manager assignment", value: project.managerId ? "Assigned" : "Awaiting a manager" },
    { label: "Construction status", value: project.status.replace(/^\w/, (c) => c.toUpperCase()) },
    { label: "Overall completion", value: `${project.overallProgress}%` },
    { label: "Current stage", value: currentStage },
    { label: "Delays", value: delayed > 0 ? `${delayed} task${delayed === 1 ? "" : "s"} delayed` : "None" },
  ];

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ClipboardList size={15} className="text-brand" /> Project status
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="text-inkmuted">{r.label}</span>
            <span className="font-medium text-ink">{r.value}</span>
          </div>
        ))}
      </div>
      {delayed > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-amber/30 bg-amber/5 px-3 py-2 text-xs text-amber">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {delayed} task{delayed === 1 ? " is" : "s are"} behind schedule — check in with your manager.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function TaskReadOnlyList({ tasks, title }: { tasks: Task[]; title: string }) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-3 text-sm font-semibold text-ink">{title}</div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
            <div>
              <div className="text-sm font-medium text-ink">{t.name}</div>
              <div className="text-xs text-inkmuted">
                {t.supervisorId ? getUserById(t.supervisorId)?.name : "Unassigned"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24"><ProgressBar value={t.progress} size="sm" /></div>
              <Badge value={t.status} />
            </div>
          </div>
        ))}
        {tasks.length === 0 && <EmptyState text="No tasks broken out yet — your manager will divide this project into tasks." />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function RecentReportsCard({ reports }: { reports: ReturnType<typeof getProgressReportsForProject> }) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-3 text-sm font-semibold text-ink">Recent progress reports</div>
      <div className="space-y-2">
        {reports.map((r) => (
          <div key={r.id} className="rounded-md border border-line px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{getUserById(r.supervisorId)?.name}</span>
              <span className="font-mono text-xs text-inkmuted">{r.date}</span>
            </div>
            <p className="mt-1 text-xs text-inkmuted">{r.workCompleted || "Progress updated"} — {r.progress}%</p>
            {r.issues && r.issues !== "None" && <p className="mt-1 text-xs text-amber">Issue: {r.issues}</p>}
          </div>
        ))}
        {reports.length === 0 && <EmptyState text="No progress reports submitted yet." />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function PhotoGallery({ photos }: { photos: ReturnType<typeof getSitePhotosForProject> }) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Camera size={15} className="text-brand" /> Site progress gallery
      </div>
      {photos.length === 0 ? (
        <EmptyState text="No site photos uploaded yet." />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 9).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.imageDataUrl} alt={p.description || "Site photo"} className="aspect-square w-full rounded-md object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function ProjectRequestsCard({ requests }: { requests: ReturnType<typeof getResourceRequests> }) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-ink">Resource requests on this project</div>
        <Link href="/manager/resource-requests" className="text-xs text-brand hover:underline">Manage all →</Link>
      </div>
      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
            <span className="text-inkmuted">
              <span className="font-medium text-ink">{getUserById(r.supervisorId)?.name}</span> requested {r.requestedQuantity} {r.resourceName}
            </span>
            <Badge value={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
