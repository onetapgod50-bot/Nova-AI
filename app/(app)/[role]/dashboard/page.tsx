import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  Boxes,
  ListChecks,
  PackageSearch,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getProjectsForUser,
  getTasksForSupervisor,
  getTasksForProject,
  getResourceRequests,
  getProgressReportsForProject,
  getResourcesForProject,
  getUserById,
} from "@/lib/data";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import ProgressBar from "@/components/ProgressBar";
import ProgressDonut from "@/components/charts/ProgressDonut";

function daysUntil(dateStr: string) {
  if (!dateStr) return Infinity;
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const { userId, role } = session;
  const user = getUserById(userId);
  const projects = getProjectsForUser(userId, role);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.overallProgress, 0) / projects.length)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Welcome back, {user?.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-inkmuted">
          {role === "engineer" && "Here's where your projects stand today."}
          {role === "manager" && "Here's what needs your attention across your projects."}
          {role === "supervisor" && "Here's your task load and site status today."}
        </p>
      </div>

      {role === "engineer" && <EngineerDashboard projects={projects} avgProgress={avgProgress} />}
      {role === "manager" && <ManagerDashboard projects={projects} managerId={userId} avgProgress={avgProgress} />}
      {role === "supervisor" && <SupervisorDashboard supervisorId={userId} projects={projects} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
function EngineerDashboard({
  projects,
  avgProgress,
}: {
  projects: ReturnType<typeof getProjectsForUser>;
  avgProgress: number;
}) {
  const active = projects.filter((p) => p.status === "active" || p.status === "delayed").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const planning = projects.filter((p) => p.status === "planning").length;

  const deadlines = projects
    .flatMap((p) => getTasksForProject(p.id).map((t) => ({ ...t, projectName: p.name })))
    .filter((t) => t.status !== "completed" && daysUntil(t.deadline) <= 21 && daysUntil(t.deadline) >= 0)
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Active Projects" value={active} icon={Clock} accent="blueprint" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} />
        <StatCard label="Under Planning" value={planning} icon={ClipboardList} accent="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-line bg-surface p-5 lg:col-span-1">
          <div className="text-sm font-medium text-ink">Overall progress</div>
          <div className="mt-4 flex justify-center">
            <ProgressDonut value={avgProgress} />
          </div>
          <p className="mt-3 text-center text-xs text-inkmuted">Average across {projects.length} project{projects.length === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-md border border-line bg-surface p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-ink">Recent projects</div>
            <Link href="/engineer/projects" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/engineer/projects/${p.id}`} className="block rounded-md border border-line p-3 hover:border-brand">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{p.name}</span>
                  <Badge value={p.status} />
                </div>
                <div className="mt-2"><ProgressBar value={p.overallProgress} size="sm" /></div>
              </Link>
            ))}
            {projects.length === 0 && <EmptyRow text="No projects yet — create your first one." />}
          </div>
        </div>
      </div>

      <DeadlinesCard items={deadlines} />
    </>
  );
}

// ---------------------------------------------------------------------------
function ManagerDashboard({
  projects,
  managerId,
  avgProgress,
}: {
  projects: ReturnType<typeof getProjectsForUser>;
  managerId: string;
  avgProgress: number;
}) {
  const active = projects.filter((p) => p.status === "active").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const delayed = projects.filter((p) => p.status === "delayed").length;

  const requests = projects.flatMap((p) => getResourceRequests({ projectId: p.id }));
  const pendingRequests = requests.filter((r) => r.status === "pending");

  const recentReports = projects
    .flatMap((p) => getProgressReportsForProject(p.id).map((r) => ({ ...r, projectName: p.name })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const resources = projects.flatMap((p) => getResourcesForProject(p.id));
  const totalAllocated = resources.reduce((s, r) => s + r.allocated, 0);
  const totalUsed = resources.reduce((s, r) => s + r.used, 0);
  const usagePct = totalAllocated ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Active" value={active} icon={Clock} accent="blueprint" />
        <StatCard label="Delayed" value={delayed} icon={AlertTriangle} accent="amber" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-line bg-surface p-5">
          <div className="text-sm font-medium text-ink">Overall progress</div>
          <div className="mt-4 flex justify-center"><ProgressDonut value={avgProgress} /></div>
        </div>
        <div className="rounded-md border border-line bg-surface p-5">
          <div className="text-sm font-medium text-ink">Resource usage</div>
          <div className="mt-4 flex justify-center"><ProgressDonut value={usagePct} /></div>
          <p className="mt-3 text-center text-xs text-inkmuted">Used vs. allocated, all projects</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-ink">Resource requests</div>
            <Link href="/manager/resource-requests" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-amber">{pendingRequests.length}</div>
          <p className="text-xs text-inkmuted">Pending your approval</p>
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-medium text-ink">Recent supervisor updates</div>
        <div className="space-y-2">
          {recentReports.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <span className="text-inkmuted">
                <span className="font-medium text-ink">{getUserById(r.supervisorId)?.name}</span> updated{" "}
                <span className="text-ink">{r.projectName}</span> to {r.progress}%
              </span>
              <span className="shrink-0 font-mono text-xs text-inkmuted">{r.date}</span>
            </div>
          ))}
          {recentReports.length === 0 && <EmptyRow text="No progress updates yet." />}
        </div>
      </div>

      <ProjectListCard title="Your projects" basePath="/manager" projects={projects} />
    </>
  );
}

// ---------------------------------------------------------------------------
function SupervisorDashboard({
  supervisorId,
  projects,
}: {
  supervisorId: string;
  projects: ReturnType<typeof getProjectsForUser>;
}) {
  const tasks = getTasksForSupervisor(supervisorId);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status !== "completed").length;
  const current = tasks.find((t) => t.status === "in_progress");

  const requests = getResourceRequests({ supervisorId });
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const resources = projects.flatMap((p) => getResourcesForProject(p.id));
  const myResources = resources.filter((r) => tasks.some((t) => t.id === r.taskId));

  const deadlines = tasks
    .filter((t) => t.status !== "completed" && daysUntil(t.deadline) <= 21)
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 5)
    .map((t) => ({ ...t, projectName: projects.find((p) => p.id === t.projectId)?.name || "" }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Assigned Tasks" value={tasks.length} icon={ListChecks} />
        <StatCard label="Completed Tasks" value={completed} icon={CheckCircle2} />
        <StatCard label="Pending Tasks" value={pending} icon={Clock} accent="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-line bg-surface p-5 lg:col-span-1">
          <div className="text-sm font-medium text-ink">Current task</div>
          {current ? (
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">{current.name}</div>
              <div className="mt-1 text-xs text-inkmuted">
                {projects.find((p) => p.id === current.projectId)?.name}
              </div>
              <div className="mt-3"><ProgressBar value={current.progress} /></div>
              <div className="mt-1 text-right font-mono text-xs text-inkmuted">{current.progress}%</div>
              <Link
                href={`/supervisor/tasks/${current.id}`}
                className="mt-3 inline-block text-xs font-medium text-brand hover:underline"
              >
                Update progress →
              </Link>
            </div>
          ) : (
            <EmptyRow text="No task currently in progress." />
          )}
        </div>

        <div className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <PackageSearch size={15} className="text-brand" /> Available resources
          </div>
          <div className="mt-3 space-y-2">
            {myResources.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-inkmuted">{r.name}</span>
                <span className="font-mono text-xs text-ink">{r.allocated - r.used} {r.unit} left</span>
              </div>
            ))}
            {myResources.length === 0 && <EmptyRow text="No resources tracked for your tasks yet." />}
          </div>
        </div>

        <div className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Boxes size={15} className="text-brand" /> Resource requests
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-amber">{pendingRequests}</div>
          <p className="text-xs text-inkmuted">Pending manager approval</p>
          <Link href="/supervisor/resources" className="mt-3 inline-block text-xs font-medium text-brand hover:underline">
            Request resources →
          </Link>
        </div>
      </div>

      <DeadlinesCard items={deadlines} />
    </>
  );
}

// ---------------------------------------------------------------------------
function DeadlinesCard({
  items,
}: {
  items: { id: string; name: string; deadline: string; status: string; projectName: string }[];
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-3 text-sm font-medium text-ink">Upcoming deadlines</div>
      <div className="space-y-2">
        {items.map((t) => {
          const days = daysUntil(t.deadline);
          return (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <div>
                <div className="font-medium text-ink">{t.name}</div>
                <div className="text-xs text-inkmuted">{t.projectName}</div>
              </div>
              <div className="text-right">
                <Badge value={t.status} />
                <div className={`mt-1 font-mono text-xs ${days <= 3 ? "text-amber" : "text-inkmuted"}`}>
                  {days === 0 ? "Due today" : days < 0 ? `${-days}d overdue` : `${days}d left`}
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <EmptyRow text="Nothing due in the next three weeks." />}
      </div>
    </div>
  );
}

function ProjectListCard({
  title,
  basePath,
  projects,
}: {
  title: string;
  basePath: string;
  projects: ReturnType<typeof getProjectsForUser>;
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-3 text-sm font-medium text-ink">{title}</div>
      <div className="space-y-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`${basePath}/projects/${p.id}`}
            className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm hover:border-brand"
          >
            <span className="font-medium text-ink">{p.name}</span>
            <div className="flex items-center gap-3">
              <span className="w-24"><ProgressBar value={p.overallProgress} size="sm" /></span>
              <Badge value={p.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed border-line px-3 py-4 text-center text-xs text-inkmuted">{text}</p>;
}
