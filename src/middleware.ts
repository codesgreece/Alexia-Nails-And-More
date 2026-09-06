import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authSecret = () =>
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = authSecret();

  // Without a secret, NextAuth cannot validate sessions — send a clear signal.
  if (!secret && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return NextResponse.json(
      {
        message:
          "Missing AUTH_SECRET on the server. Set AUTH_SECRET in Vercel → Settings → Environment Variables, then Redeploy.",
      },
      { status: 500 }
    );
  }

  if (pathname === "/admin/login") {
    if (secret) {
      const token = await getToken({ req: request, secret });
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  const token = secret
    ? await getToken({ req: request, secret })
    : null;

  if (!token || token.role !== "ADMIN") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
