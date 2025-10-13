import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEV_AUTH_COOKIE_NAME,
  isLocalRunMode,
} from "@/lib/auth/devSession";
import { buildContentSecurityPolicy } from "@/server/headers/common";

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const nonce = generateNonce();
  requestHeaders.set("x-nonce", nonce);
  const allowUnsafeEval = process.env.NODE_ENV !== "production";

  if (isLocalRunMode() && !requestHeaders.has("authorization")) {
    const tokenCookie = request.cookies.get(DEV_AUTH_COOKIE_NAME);
    const token = tokenCookie?.value?.trim();
    if (token) {
      requestHeaders.set("authorization", `Bearer ${token}`);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    "content-security-policy",
    buildContentSecurityPolicy({ nonce, allowUnsafeEval }),
  );
  appendVary(response.headers, "Authorization");
  return response;
}

function appendVary(headers: Headers, value: string): void {
  const current = headers.get("vary");
  if (!current) {
    headers.set("vary", value);
    return;
  }
  const parts = current.split(",").map((part) => part.trim());
  if (!parts.includes(value)) {
    parts.push(value);
    headers.set("vary", parts.join(", "));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
