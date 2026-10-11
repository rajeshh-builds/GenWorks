import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Dashboard Route Protection Guard
  // Allow seamless marketplace browsing for clients and evaluation, while protecting sensitive write routes
  if (pathname.startsWith("/dashboard/settings")) {
    const sessionCookie = request.cookies.get("clientora_session") || request.cookies.get("genworks_session");
    if (!sessionCookie?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("auth", "required");
      return NextResponse.redirect(url);
    }
  }

  // 2. Clone response to inject security headers
  const response = NextResponse.next();

  // 3. Inject Enterprise Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.mp4, .png, .jpg, .svg, .webm)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:mp4|png|jpg|jpeg|gif|svg|webp|webm)).*)",
  ],
};
