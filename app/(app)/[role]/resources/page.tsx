import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getProjectsForUser,
  getTasksForProject,
  getResourcesForProject,
  getTasksForSupervisor,
  getResourceRequests,
} from "@/lib/data";
import ProgressBar from "@/components/ProgressBar";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import ResourcePanel from "@/components/project/ResourcePanel";
import RequestResourceButton from "@/components/project/RequestResourceButton";

export default async function ResourcesPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "engineer") redirect("/engineer/projects");

  if (session.role === "manager") {
    const projects = getProjectsForUser(session.userId, "manager");
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-ink">Resources</h1>
          <p className="mt-1 text-sm text-inkmuted">Allocation across every project you manage.</p>
        </div>
        {projects.map((p) => {
          const tasks = getTasksForProject(p.id);
          const resources = getResourcesForProject(p.id);
          return (
            <div key={p.id}>
              <div className="mb-2 text-sm font-medium text-inkmuted">{p.name}</div>
              <ResourcePanel projectId={p.id} tasks={tasks} resources={resources} />
            </div>
          );
        })}
        {projects.length === 0 && <EmptyState text="No projects assigned to you yet." />}
      </div>
    );
  }

  // supervisor
  const tasks = getTasksForSupervisor(session.userId);
  const projects = getProjectsForUser(session.userId, "supervisor");
  const resources = projects
    .flatMap((p) => getResourcesForProject(p.id))
    .filter((r) => tasks.some((t) => t.id === r.taskId));
  const myRequests = getResourceRequests({ supervisorId: session.userId }).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">My Resources</h1>
        <p className="mt-1 text-sm text-inkmuted">What's allocated to your tasks, and what you've requested.</p>
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
          <Boxes size={15} className="text-brand" /> Available resources
        </div>
        <div className="space-y-3">
          {resources.map((r) => {
            const remaining = r.allocated - r.used;
            const usagePct = r.allocated ? Math.round((r.used / r.allocated) * 100) : 0;
            const task = tasks.find((t) => t.id === r.taskId);
            return (
              <div key={r.id} className="rounded-md border border-line p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{r.name}</span>
                  <span className="font-mono text-xs text-inkmuted">{remaining} {r.unit} left</span>
                </div>
                <div className="mt-2"><ProgressBar value={usagePct} size="sm" tone={usagePct >= 90 ? "amber" : "brand"} /></div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-inkmuted">{task?.name}</span>
                  <RequestResourceButton resource={r} />
                </div>
              </div>
            );
          })}
          {resources.length === 0 && <EmptyState text="No resources tracked for your tasks yet." />}
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-ink">Your resource requests</div>
        <div className="space-y-2">
          {myRequests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-ink">{r.requestedQuantity} {r.resourceName}</span>
                <span className="ml-2 text-xs text-inkmuted">{r.date}</span>
              </div>
              <Badge value={r.status} />
            </div>
          ))}
          {myRequests.length === 0 && <EmptyState text="You haven't requested any resources yet." />}
        </div>
      </div>
    </div>
  );
}
