import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNotificationsForUser, markNotificationRead } from "@/lib/data";

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const owns = getNotificationsForUser(session.userId).some((n) => n.id === id);
  if (!owns) return NextResponse.json({ error: "Notification not found." }, { status: 404 });

  const updated = markNotificationRead(id);
  return NextResponse.json({ notification: updated });
}
