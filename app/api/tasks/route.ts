import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTasksForProject, getTasksForSupervisor, createTask, getProjectById } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (session.role === "supervisor" && !projectId) {
    return NextResponse.json({ tasks: getTasksForSupervisor(session.userId) });
  }
  if (!projectId) return NextResponse.json({ error: "projectId is required." }, { status: 400 });

  const tasks = getTasksForProject(projectId);
  const visible =
    session.role === "supervisor"
      ? tasks.filter((t) => t.supervisorId === session.userId)
      : tasks;
  return NextResponse.json({ tasks: visible });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "manager") {
    return NextResponse.json({ error: "Only managers can create tasks." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.projectId || !body?.name) {
    return NextResponse.json({ error: "projectId and task name are required." }, { status: 400 });
  }
  const project = getProjectById(body.projectId);
  if (!project || project.managerId !== session.userId) {
    return NextResponse.json({ error: "You don't manage this project." }, { status: 403 });
  }

  const task = createTask({
    projectId: body.projectId,
    name: body.name,
    description: body.description || "",
    supervisorId: body.supervisorId || null,
    startDate: body.startDate || new Date().toISOString().slice(0, 10),
    deadline: body.deadline || "",
    priority: body.priority || "medium",
    requiredResources: body.requiredResources || "",
    estimatedQuantity: body.estimatedQuantity || "",
    status: "not_started",
    progress: 0,
  });

  return NextResponse.json({ task }, { status: 201 });
}
