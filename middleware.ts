import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/Login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",

  
  
  
  ],
};