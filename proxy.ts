import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// First line of defence for signed-in areas: no session cookie → straight to /login.
// Authorization (admin or not, whose order it is) is still decided server-side in every page and action.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/app", "/order", "/orders/:path*", "/profile"],
};
