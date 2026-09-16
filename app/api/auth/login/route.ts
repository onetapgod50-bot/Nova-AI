import { NextRequest, NextResponse } from "next/server";
import { findUser } from "@/lib/data";
import { setSessionCookie } from "@/lib/auth";
import type { Role } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;
  const role = body?.role as Role | undefined;

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Email, password, and role are required." }, { status: 400 });
  }

  const user = findUser(email, password, role);
  if (!user) {
    return NextResponse.json(
      { error: "No account matches that email, password, and role." },
      { status: 401 }
    );
  }

  await setSessionCookie({ userId: user.id, role: user.role });
  return NextResponse.json({ id: user.id, name: user.name, role: user.role });
}
