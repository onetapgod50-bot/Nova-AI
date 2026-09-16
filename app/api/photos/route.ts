import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSitePhotosForProject, addSitePhoto, getTaskById } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required." }, { status: 400 });

  return NextResponse.json({ photos: getSitePhotosForProject(projectId) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "supervisor") {
    return NextResponse.json({ error: "Only supervisors upload site photos." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.taskId || !body?.imageDataUrl) {
    return NextResponse.json({ error: "taskId and imageDataUrl are required." }, { status: 400 });
  }
  const task = getTaskById(body.taskId);
  if (!task || task.supervisorId !== session.userId) {
    return NextResponse.json({ error: "This task isn't assigned to you." }, { status: 403 });
  }

  const photo = addSitePhoto({
    projectId: task.projectId,
    taskId: task.id,
    supervisorId: session.userId,
    imageDataUrl: body.imageDataUrl,
    description: body.description || "",
    location: body.location || "",
  });

  return NextResponse.json({ photo }, { status: 201 });
}
