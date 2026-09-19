import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Optimistic redirect only (reads the session cookie, no DB call).
// Real authorization still happens in the DAL (src/lib/dal.ts) on every
// page, Server Action, and Route Handler — see AGENTS.md / Next.js docs
// on why Proxy must not be the sole line of defense.
const protectedPrefixes = ["/dashboard", "/admin"];

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth);
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
