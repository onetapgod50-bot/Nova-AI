import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  encodeSession,
  decodeSession,
  type Session,
} from "./session";

// ---------------------------------------------------------------------------
// Demo session handling. No password hashing, no DB-backed sessions — this
// keeps the app functional before a real auth provider is wired up. Before
// production, swap this for NextAuth.js / Clerk / Lucia, and hash passwords
// (bcrypt/argon2) in lib/data.ts instead of storing them in plain text.
//
// For use in Server Components and Route Handlers only (relies on
// next/headers). Middleware uses lib/session.ts directly instead.
// ---------------------------------------------------------------------------

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, await encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export type { Session };
