import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Extract `loggedIn` flag from cookies or session storage equivalent
  const loggedIn = request.cookies.get("loggedIn")?.value;

  if (request.nextUrl.pathname.startsWith("/admin") && !loggedIn) {
    // Redirect to login page
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
