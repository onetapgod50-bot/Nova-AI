import type { Role } from "./types";

// ---------------------------------------------------------------------------
// Pure session encode/decode — no Node-only APIs, so this file can be
// imported from both middleware.ts (Edge runtime) and route handlers /
// server components (Node runtime). Uses the Web Crypto API (crypto.subtle),
// which both runtimes provide as a global.
// ---------------------------------------------------------------------------

export const SESSION_COOKIE_NAME = "bn_session";

const SECRET = process.env.SESSION_SECRET || "buildnova-dev-secret-change-me";

export interface Session {
  userId: string;
  role: Role;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToHex(sig);
}

export async function encodeSession(session: Session): Promise<string> {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(value: string | undefined | null): Promise<Session | null> {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = await sign(payload);
  if (expected !== signature) return null;
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(payload));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
