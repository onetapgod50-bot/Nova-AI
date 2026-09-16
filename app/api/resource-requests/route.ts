import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResourceRequests, createResourceRequest, getTaskById, getProjectsForUser } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;

  if (session.role === "supervisor") {
    return NextResponse.json({ requests: getResourceRequests({ projectId, supervisorId: session.userId }) });
  }
  if (session.role === "manager") {
    if (projectId) return NextResponse.json({ requests: getResourceRequests({ projectId }) });
    const myProjectIds = new Set(getProjectsForUser(session.userId, "manager").map((p) => p.id));
    const all = getResourceRequests({});
    return NextResponse.json({ requests: all.filter((r) => myProjectIds.has(r.projectId)) });
  }
  return NextResponse.json({ requests: [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "supervisor") {
    return NextResponse.json({ error: "Only supervisors request resources." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.taskId || !body?.resourceName || body?.requestedQuantity === undefined) {
    return NextResponse.json(
      { error: "taskId, resourceName, and requestedQuantity are required." },
      { status: 400 }
    );
  }
  const task = getTaskById(body.taskId);
  if (!task || task.supervisorId !== session.userId) {
    return NextResponse.json({ error: "This task isn't assigned to you." }, { status: 403 });
  }

  const request_ = createResourceRequest({
    projectId: task.projectId,
    taskId: task.id,
    supervisorId: session.userId,
    resourceName: body.resourceName,
    currentQuantity: Number(body.currentQuantity) || 0,
    requestedQuantity: Number(body.requestedQuantity),
    reason: body.reason || "",
  });

  return NextResponse.json({ request: request_ }, { status: 201 });
}
