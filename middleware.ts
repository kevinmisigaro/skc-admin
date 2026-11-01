import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on every page route, including /login — the handler itself decides
  // whether to gate (signed out → /login) or bounce away (signed in on
  // /login → /). API routes are excluded: they do their own
  // getAdminSession() check and should return JSON 401s, not HTML redirects.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
