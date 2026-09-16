import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResourcesForProject, allocateResource, getProjectById } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required." }, { status: 400 });

  return NextResponse.json({ resources: getResourcesForProject(projectId) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "manager") {
    return NextResponse.json({ error: "Only managers allocate resources." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.projectId || !body?.name || body?.allocated === undefined) {
    return NextResponse.json({ error: "projectId, name, and allocated are required." }, { status: 400 });
  }
  const project = getProjectById(body.projectId);
  if (!project || project.managerId !== session.userId) {
    return NextResponse.json({ error: "You don't manage this project." }, { status: 403 });
  }

  const resource = allocateResource({
    projectId: body.projectId,
    taskId: body.taskId || null,
    name: body.name,
    unit: body.unit || "",
    allocated: Number(body.allocated) || 0,
    used: 0,
    required: Number(body.required) || Number(body.allocated) || 0,
    allocationDate: new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ resource }, { status: 201 });
}
