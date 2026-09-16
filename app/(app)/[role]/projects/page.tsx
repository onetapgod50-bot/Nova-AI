import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getProjectsForUser, getUnassignedProjects } from "@/lib/data";
import Badge from "@/components/Badge";
import ProgressBar from "@/components/ProgressBar";
import EmptyState from "@/components/EmptyState";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) return null;
  const { role, userId } = session;

  const projects = getProjectsForUser(userId, role);
  const unassigned = role === "manager" ? getUnassignedProjects() : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {role === "supervisor" ? "My Projects" : "Projects"}
          </h1>
          <p className="mt-1 text-sm text-inkmuted">
            {role === "engineer" && "Projects you've planned, from first draft to completion."}
            {role === "manager" && "Projects you're actively managing."}
            {role === "supervisor" && "Projects that include a task assigned to you."}
          </p>
        </div>
        {role === "engineer" && (
          <Link
            href="/engineer/projects/new"
            className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
          >
            <Plus size={15} /> Create Project
          </Link>
        )}
      </div>

      {role === "manager" && unassigned.length > 0 && (
        <div className="rounded-md border border-amber/30 bg-amber/5 p-4">
          <div className="text-sm font-medium text-ink">Awaiting a manager</div>
          <p className="mt-1 text-xs text-inkmuted">
            These projects have finished engineer planning and don't have a manager assigned yet.
          </p>
          <div className="mt-3 space-y-2">
            {unassigned.map((p) => (
              <Link
                key={p.id}
                href={`/manager/projects/${p.id}`}
                className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-sm hover:border-brand"
              >
                <span className="font-medium text-ink">{p.name}</span>
                <span className="text-xs text-brand">Open to take this project →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/${role}/projects/${p.id}`}
            className="flex flex-col rounded-md border border-line bg-surface p-5 hover:border-brand"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{p.name}</span>
              <Badge value={p.status} />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-inkmuted">
              <MapPin size={12} /> {p.location}
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-inkmuted">{p.description}</p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between font-mono text-xs text-inkmuted">
                <span>Progress</span>
                <span>{p.overallProgress}%</span>
              </div>
              <ProgressBar value={p.overallProgress} size="sm" />
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-3 text-xs text-inkmuted">
              <span>{p.employer}</span>
              <span className="font-mono">{p.expectedCompletion || "TBD"}</span>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <EmptyState
          text={
            role === "engineer"
              ? "No projects yet — create your first one to get started."
              : "No projects assigned to you yet."
          }
        />
      )}
    </div>
  );
}
