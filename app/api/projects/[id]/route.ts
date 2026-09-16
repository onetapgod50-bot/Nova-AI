import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getProjectById,
  updateProject,
  getBlueprintForProject,
  upsertBlueprint,
  getTasksForProject,
} from "@/lib/data";

function canAccess(session: { userId: string; role: string }, project: NonNullable<ReturnType<typeof getProjectById>>) {
  if (session.role === "engineer") return project.engineerId === session.userId;
  if (session.role === "manager") return !project.managerId || project.managerId === session.userId;
  return getTasksForProject(project.id).some((t) => t.supervisorId === session.userId);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!canAccess(session, project)) {
    return NextResponse.json({ error: "You don't have access to this project." }, { status: 403 });
  }

  const blueprint = getBlueprintForProject(id);
  return NextResponse.json({ project, blueprint });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!canAccess(session, project)) {
    return NextResponse.json({ error: "You don't have access to this project." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (session.role === "manager" && !project.managerId) {
    updateProject(id, { managerId: session.userId, status: "active" });
  }

  const patch: Record<string, unknown> = {};
  for (const key of ["status", "overallProgress", "description", "otherRequirements"]) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  if (Object.keys(patch).length) updateProject(id, patch);

  let blueprint = getBlueprintForProject(id);
  if (body.blueprint) {
    blueprint = upsertBlueprint(id, {
      fileName: body.blueprint.fileName,
      notes: body.blueprint.notes,
      measurements: body.blueprint.measurements,
      uploadedBy: session.userId,
    });
  }

  return NextResponse.json({ project: getProjectById(id), blueprint });
}
