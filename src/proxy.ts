import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export function proxy(request: NextRequest) {
  // Bu yalnız erken yönlendirme optimizasyonudur; gerçek doğrulama admin
  // layout'unda Firebase Admin ile yapılır.
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
