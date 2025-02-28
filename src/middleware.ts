import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const includedPaths: string[] = [
  "/home",
  "/designs",
  "/assign",
  "/analytics",
  "/email",
  "/workspace",
  "/refer",
  "/support",
  "/feedback",
  "/credits",
];

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/home/:path*",
    "/designs/:path*",
    "/assign/:path*",
    "/analytics/:path*",
    "/email/:path*",
    "/workspace/:path*",
    "/refer/:path*",
    "/support/:path*",
    "/feedback/:path*",
    "/credits/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
