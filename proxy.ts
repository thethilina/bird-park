import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  const pathname = req.nextUrl.pathname;

  // Public routes
  if (
    pathname.startsWith("/Login") ||
    pathname.startsWith("/Register") ||
    pathname.startsWith("/api") 
  ) {
    return NextResponse.next();
  }

  // Protect homepage
  if (pathname === "/" && !token) {
    return NextResponse.redirect(
      new URL("/Login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};