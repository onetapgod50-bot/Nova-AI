import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProjectsForUser, createProject } from "@/lib/data";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const projects = getProjectsForUser(session.userId, session.role);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "engineer") {
    return NextResponse.json({ error: "Only engineers can create projects." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.employer || !body?.location) {
    return NextResponse.json({ error: "Project name, employer, and location are required." }, { status: 400 });
  }

  const project = createProject({
    name: body.name,
    employer: body.employer,
    location: body.location,
    landArea: body.landArea || "",
    gpsLocation: body.gpsLocation || "",
    projectType: body.projectType || "",
    description: body.description || "",
    requiredInfrastructure: body.requiredInfrastructure || "",
    startDate: body.startDate || new Date().toISOString().slice(0, 10),
    expectedCompletion: body.expectedCompletion || "",
    budget: Number(body.budget) || 0,
    requiredWorkers: Number(body.requiredWorkers) || 0,
    otherRequirements: body.otherRequirements || "",
    engineerId: session.userId,
  });

  return NextResponse.json({ project }, { status: 201 });
}
