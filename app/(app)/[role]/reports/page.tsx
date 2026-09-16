import { getSession } from "@/lib/auth";
import {
  getProjectsForUser,
  getTasksForProject,
  getTasksForSupervisor,
  getResourcesForProject,
  getProgressReportsForProject,
  getUserById,
  getUsersByRole,
} from "@/lib/data";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import TaskProgressChart from "@/components/charts/TaskProgressChart";
import TrendLine from "@/components/charts/TrendLine";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";

function daysUntil(dateStr: string) {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) return null;
  const { role, userId } = session;
  const projects = getProjectsForUser(userId, role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 text-sm text-inkmuted">Progress, deadlines, and resource performance at a glance.</p>
      </div>

      {role === "engineer" && <EngineerReports projects={projects} />}
      {role === "manager" && <ManagerReports projects={projects} />}
      {role === "supervisor" && <SupervisorReports supervisorId={userId} projects={projects} />}
    </div>
  );
}

function EngineerReports({ projects }: { projects: ReturnType<typeof getProjectsForUser> }) {
  const chartData = projects.map((p) => ({ name: p.name, progress: p.overallProgress, status: p.status }));
  const onTrack = projects.filter((p) => p.status !== "delayed").length;
  const atRisk = projects.filter((p) => p.status === "delayed").length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Projects" value={projects.length} icon={CheckCircle2} />
        <StatCard label="On Track" value={onTrack} icon={Clock} accent="blueprint" />
        <StatCard label="Delayed" value={atRisk} icon={AlertTriangle} accent="amber" />
      </div>
      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-4 text-sm font-semibold text-ink">Overall progress by project</div>
        {chartData.length > 0 ? <TaskProgressChart data={chartData} /> : <EmptyState text="No projects yet." />}
      </div>
      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-ink">Deadline performance</div>
        <div className="space-y-2">
          {projects.map((p) => {
            const days = daysUntil(p.expectedCompletion);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
                <span className="text-ink">{p.name}</span>
                <span className={`font-mono text-xs ${days < 0 ? "text-clay" : days <= 14 ? "text-amber" : "text-inkmuted"}`}>
                  {p.status === "completed" ? "Completed" : days < 0 ? `${-days}d overdue` : `${days}d remaining`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ManagerReports({ projects }: { projects: ReturnType<typeof getProjectsForUser> }) {
  const tasks = projects.flatMap((p) => getTasksForProject(p.id));
  const resources = projects.flatMap((p) => getResourcesForProject(p.id));
  const delayed = tasks.filter((t) => t.status === "delayed");
  const completed = tasks.filter((t) => t.status === "completed").length;

  const taskChart = tasks.slice(0, 10).map((t) => ({ name: t.name, progress: t.progress, status: t.status }));
  const resourceChart = resources.map((r) => ({
    name: r.name,
    progress: r.allocated ? Math.round((r.used / r.allocated) * 100) : 0,
    status: r.allocated && r.used / r.allocated >= 0.9 ? "delayed" : "in_progress",
  }));

  const supervisors = getUsersByRole("supervisor");
  const performance = supervisors
    .map((s) => ({ name: s.name, completed: tasks.filter((t) => t.supervisorId === s.id && t.status === "completed").length, total: tasks.filter((t) => t.supervisorId === s.id).length }))
    .filter((s) => s.total > 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Tasks" value={tasks.length} icon={CheckCircle2} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} accent="brand" />
        <StatCard label="Delayed" value={delayed.length} icon={AlertTriangle} accent="amber" />
        <StatCard label="Resources Tracked" value={resources.length} icon={TrendingUp} accent="blueprint" />
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-4 text-sm font-semibold text-ink">Task completion</div>
        {taskChart.length > 0 ? <TaskProgressChart data={taskChart} /> : <EmptyState text="No tasks yet." />}
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-4 text-sm font-semibold text-ink">Resource consumption (% used)</div>
        {resourceChart.length > 0 ? <TaskProgressChart data={resourceChart} /> : <EmptyState text="No resources allocated yet." />}
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-ink">Supervisor performance</div>
        <div className="space-y-2">
          {performance.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <span className="text-ink">{s.name}</span>
              <span className="font-mono text-xs text-inkmuted">{s.completed}/{s.total} tasks completed</span>
            </div>
          ))}
          {performance.length === 0 && <EmptyState text="No supervisors have assigned tasks yet." />}
        </div>
      </div>

      {delayed.length > 0 && (
        <div className="rounded-md border border-amber/30 bg-amber/5 p-5">
          <div className="mb-3 text-sm font-semibold text-ink">Delayed tasks</div>
          <div className="space-y-1.5 text-sm">
            {delayed.map((t) => (
              <div key={t.id} className="flex justify-between text-inkmuted">
                <span>{t.name}</span>
                <span className="font-mono text-xs">{t.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SupervisorReports({
  supervisorId,
  projects,
}: {
  supervisorId: string;
  projects: ReturnType<typeof getProjectsForUser>;
}) {
  const tasks = getTasksForSupervisor(supervisorId);
  const chartData = tasks.map((t) => ({ name: t.name, progress: t.progress, status: t.status }));

  const reportPoints = projects
    .flatMap((p) => getProgressReportsForProject(p.id))
    .filter((r) => r.supervisorId === supervisorId)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date, progress: r.progress }));

  const resources = projects
    .flatMap((p) => getResourcesForProject(p.id))
    .filter((r) => tasks.some((t) => t.id === r.taskId));

  return (
    <>
      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-4 text-sm font-semibold text-ink">Your task progress</div>
        {chartData.length > 0 ? <TaskProgressChart data={chartData} /> : <EmptyState text="No tasks assigned yet." />}
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-4 text-sm font-semibold text-ink">Reported progress over time</div>
        {reportPoints.length > 0 ? <TrendLine data={reportPoints} /> : <EmptyState text="No progress reports submitted yet." />}
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-ink">Resource usage on your tasks</div>
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <span className="text-ink">{r.name}</span>
              <span className="font-mono text-xs text-inkmuted">{r.used}/{r.allocated} {r.unit}</span>
            </div>
          ))}
          {resources.length === 0 && <EmptyState text="No resources tracked for your tasks yet." />}
        </div>
      </div>
    </>
  );
}
