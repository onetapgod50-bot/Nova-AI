import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateResourceRequestStatus, getProjectById, getResourceRequests } from "@/lib/data";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "manager") {
    return NextResponse.json({ error: "Only managers respond to resource requests." }, { status: 403 });
  }

  const { id } = await params;
  const existing = getResourceRequests({}).find((r) => r.id === id);
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  const project = getProjectById(existing.projectId);
  if (project?.managerId !== session.userId) {
    return NextResponse.json({ error: "You don't manage this project." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body.status as "approved" | "rejected" | "modified";
  if (!["approved", "rejected", "modified"].includes(status)) {
    return NextResponse.json({ error: "status must be approved, rejected, or modified." }, { status: 400 });
  }

  const updated = updateResourceRequestStatus(id, status, body.modifiedQuantity);
  return NextResponse.json({ request: updated });
}
