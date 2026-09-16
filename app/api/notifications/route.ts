import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/data";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  return NextResponse.json({ notifications: getNotificationsForUser(session.userId) });
}
