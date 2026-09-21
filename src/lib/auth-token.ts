import type { NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";
import { getAuthSecret } from "./auth-secret";

function sessionCookieName(secure: boolean) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

export function requestIsHttps(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

/**
 * Auth.js v5 encrypts JWTs with the cookie name as salt.
 * getToken() defaults to the non-secure cookie, so production HTTPS
 * sessions (__Secure-authjs.session-token) were invisible to middleware.
 */
export async function getAdminToken(request: NextRequest): Promise<JWT | null> {
  const secret = getAuthSecret();
  const cookieNames = [
    sessionCookieName(requestIsHttps(request)),
    sessionCookieName(true),
    sessionCookieName(false),
  ];

  for (const cookieName of new Set(cookieNames)) {
    const token = await getToken({
      req: request,
      secret,
      cookieName,
      salt: cookieName,
      secureCookie: cookieName.startsWith("__Secure-"),
    });
    if (token) return token;
  }

  return null;
}

export function isAdminToken(token: JWT | null) {
  return Boolean(token && token.role === "ADMIN");
}
