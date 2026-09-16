import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProjectsForUser, getResourceRequests, getUserById, getProjectById, getTaskById } from "@/lib/data";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import ResourceRequestActions from "@/components/project/ResourceRequestActions";

export default async function ResourceRequestsPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "manager") redirect(`/${session.role}/dashboard`);

  const projectIds = new Set(getProjectsForUser(session.userId, "manager").map((p) => p.id));
  const requests = getResourceRequests({}).filter((r) => projectIds.has(r.projectId));
  const pending = requests.filter((r) => r.status === "pending").sort((a, b) => b.date.localeCompare(a.date));
  const resolved = requests.filter((r) => r.status !== "pending").sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Resource Requests</h1>
        <p className="mt-1 text-sm text-inkmuted">Approve, modify, or reject what your supervisors ask for.</p>
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-ink">Pending ({pending.length})</div>
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-md border border-amber/30 bg-amber/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {getUserById(r.supervisorId)?.name} requested {r.requestedQuantity} {r.resourceName}
                  </div>
                  <div className="mt-0.5 text-xs text-inkmuted">
                    {getProjectById(r.projectId)?.name} · {getTaskById(r.taskId)?.name} · currently {r.currentQuantity} on hand · {r.date}
                  </div>
                  {r.reason && <p className="mt-1.5 text-xs text-inkmuted">"{r.reason}"</p>}
                </div>
                <ResourceRequestActions requestId={r.id} />
              </div>
            </div>
          ))}
          {pending.length === 0 && <EmptyState text="Nothing waiting on you right now." />}
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-ink">History</div>
        <div className="space-y-2">
          {resolved.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <span className="text-inkmuted">
                <span className="font-medium text-ink">{getUserById(r.supervisorId)?.name}</span> · {r.requestedQuantity} {r.resourceName} · {getProjectById(r.projectId)?.name}
              </span>
              <Badge value={r.status} />
            </div>
          ))}
          {resolved.length === 0 && <EmptyState text="No resolved requests yet." />}
        </div>
      </div>
    </div>
  );
}
