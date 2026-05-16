import { NextRequest, NextResponse } from "next/server";
import { DEV_AUTH_COOKIE_NAME } from "@/lib/auth/devSession";
import { SESSION_COOKIE_NAME } from "@/lib/auth/token";
import { loadAppConfig } from "@/lib/config";

export async function GET(request: NextRequest) {
  return clearSessionAndRedirect(request);
}

export async function POST(request: NextRequest) {
  return clearSessionAndRedirect(request);
}

function clearSessionAndRedirect(request: NextRequest): NextResponse {
  const config = loadAppConfig();
  const response = NextResponse.redirect(
    new URL(config.runMode === "cloud" ? "/login" : "/local-login", request.url),
  );
  response.headers.append(
    "set-cookie",
    buildExpiredCookie(SESSION_COOKIE_NAME, config.runMode === "cloud"),
  );
  response.headers.append("set-cookie", buildExpiredCookie(DEV_AUTH_COOKIE_NAME, false));
  return response;
}

function buildExpiredCookie(name: string, secure: boolean): string {
  return [
    `${name}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}
