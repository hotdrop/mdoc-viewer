import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_CSP } from "@/server/headers/common";

export function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  response.headers.set("content-security-policy", DEFAULT_CSP);
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
