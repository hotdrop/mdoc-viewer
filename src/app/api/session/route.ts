import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/errors";
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  createSessionCookieFromIdToken,
} from "@/lib/auth/token";
import { loadAppConfig } from "@/lib/config";
import { logAccess } from "@/lib/logger";
import { applyCommonSecurityHeaders } from "@/server/headers/common";

type SessionRequest = {
  idToken?: unknown;
};

export async function POST(request: NextRequest) {
  const config = loadAppConfig();
  const responseHeaders = new Headers();
  responseHeaders.set("cache-control", "no-store");
  applyCommonSecurityHeaders(responseHeaders);

  try {
    const payload = (await request.json()) as SessionRequest;
    if (typeof payload.idToken !== "string") {
      throw new UnauthorizedError("ID トークンがありません。");
    }

    const sessionCookie = await createSessionCookieFromIdToken(
      config,
      payload.idToken,
    );
    responseHeaders.append(
      "set-cookie",
      buildSessionCookie(sessionCookie, config.runMode === "cloud"),
    );

    logAccess({
      user: null,
      path: request.nextUrl.pathname,
      status: 204,
      mode: config.runMode,
      route: "/api/session",
    });

    return new NextResponse(null, {
      status: 204,
      headers: responseHeaders,
    });
  } catch (error) {
    const status =
      error instanceof UnauthorizedError || error instanceof ForbiddenError
        ? error.status
        : 401;
    logAccess({
      user: null,
      path: request.nextUrl.pathname,
      status,
      mode: config.runMode,
      route: "/api/session",
      reason: status === 403 ? "auth_forbidden" : "auth_missing",
    });
    return NextResponse.json(
      { message: status === 403 ? "アクセス権限がありません。" : "認証に失敗しました。" },
      { status, headers: responseHeaders },
    );
  }
}

function buildSessionCookie(value: string, secure: boolean): string {
  const encodedValue = encodeURIComponent(value);
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodedValue}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}`,
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}
