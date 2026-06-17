import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

function getUser(request: NextRequest): JwtPayload | null {
  const token = request.cookies.get("token")?.value;
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getUser(request);

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/admin/login");

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user) {
    const dest = user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Protect dashboard — must be logged in
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect admin — must be logged in as admin
  if (isAdminPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAdminPage && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
