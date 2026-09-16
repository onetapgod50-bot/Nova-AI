import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProgressReportsForProject, addProgressReport, getTaskById } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required." }, { status: 400 });

  return NextResponse.json({ reports: getProgressReportsForProject(projectId) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "supervisor") {
    return NextResponse.json({ error: "Only supervisors submit progress updates." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.taskId || body?.progress === undefined) {
    return NextResponse.json({ error: "taskId and progress are required." }, { status: 400 });
  }
  const task = getTaskById(body.taskId);
  if (!task || task.supervisorId !== session.userId) {
    return NextResponse.json({ error: "This task isn't assigned to you." }, { status: 403 });
  }

  const report = addProgressReport({
    projectId: task.projectId,
    taskId: task.id,
    supervisorId: session.userId,
    progress: Math.max(0, Math.min(100, Number(body.progress))),
    workCompleted: body.workCompleted || "",
    workRemaining: body.workRemaining || "",
    issues: body.issues || "",
    comments: body.comments || "",
  });

  return NextResponse.json({ report }, { status: 201 });
}
