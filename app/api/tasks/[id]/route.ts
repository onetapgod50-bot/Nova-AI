import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTaskById, updateTask, getProjectById } from "@/lib/data";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const task = getTaskById(id);
  if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  const project = getProjectById(task.projectId);

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  if (session.role === "manager") {
    if (project?.managerId !== session.userId) {
      return NextResponse.json({ error: "You don't manage this project." }, { status: 403 });
    }
    for (const key of [
      "name",
      "description",
      "supervisorId",
      "startDate",
      "deadline",
      "priority",
      "requiredResources",
      "estimatedQuantity",
      "status",
      "progress",
    ]) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
  } else if (session.role === "supervisor") {
    if (task.supervisorId !== session.userId) {
      return NextResponse.json({ error: "This task isn't assigned to you." }, { status: 403 });
    }
    for (const key of ["status", "progress"]) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
  } else {
    return NextResponse.json({ error: "Engineers can't update tasks directly." }, { status: 403 });
  }

  const updated = updateTask(id, patch);
  return NextResponse.json({ task: updated });
}
