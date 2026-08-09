import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const pathname = req.nextUrl.pathname;

  // Public routes
  if (
    pathname === "/Login" ||
    pathname === "/Register" ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Protect every other page
  if (!token) {
    const loginUrl = new URL("/Login", req.url);

    // Optional: remember where the user was trying to go
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};