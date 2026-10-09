import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  exp: number;
}

const ROLE_PREFIXES: Record<string, JwtPayload["role"]> = {
  "/dashboard/customer": "CUSTOMER",
  "/dashboard/provider": "PROVIDER",
  "/dashboard/admin": "ADMIN",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Find protected dashboard section
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix),
  );

  // Not a protected dashboard route
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  // =====================================================
  // IMPORTANT
  // Backend এখন এই cookie set করছে:
  //
  // accessToken
  // refreshToken
  //
  // তাই lensloop_token ব্যবহার করা যাবে না।
  // =====================================================

  const accessToken = req.cookies.get("accessToken")?.value;

  // No access token
  if (!accessToken) {
    const loginUrl = new URL("/login", req.url);

    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);

    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);

    // =====================================================
    // Validate token payload
    // =====================================================

    if (!decoded.userId || !decoded.role || !decoded.exp) {
      throw new Error("Invalid token payload");
    }

    // =====================================================
    // Check token expiration
    // =====================================================

    if (decoded.exp * 1000 <= Date.now()) {
      const loginUrl = new URL("/login", req.url);

      loginUrl.searchParams.set("next", pathname + req.nextUrl.search);

      return NextResponse.redirect(loginUrl);
    }

    // =====================================================
    // Check role
    // =====================================================

    const requiredRole = ROLE_PREFIXES[matchedPrefix];

    if (decoded.role !== requiredRole) {
      const correctDashboard = `/dashboard/${decoded.role.toLowerCase()}`;

      return NextResponse.redirect(new URL(correctDashboard, req.url));
    }

    // =====================================================
    // Authentication successful
    // =====================================================

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);

    const loginUrl = new URL("/login", req.url);

    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);

    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
