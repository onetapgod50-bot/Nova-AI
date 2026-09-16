import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, decodeSession } from "./lib/session";

export const config = {
  matcher: ["/engineer/:path*", "/manager/:path*", "/supervisor/:path*"],
};

export async function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decodeSession(cookieValue);

  const roleInPath = request.nextUrl.pathname.split("/")[1]; // engineer | manager | supervisor

  if (!session || session.role !== roleInPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirected", "1");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
