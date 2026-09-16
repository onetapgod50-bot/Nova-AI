import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { callBuildNovaAI } from "@/lib/ai";
import type { ChatMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const message = body?.message as string | undefined;
  const history = (body?.history as ChatMessage[] | undefined) || [];

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const reply = await callBuildNovaAI(session.userId, session.role, message.trim(), history);
  return NextResponse.json({ reply });
}
