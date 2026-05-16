import type { NextRequest } from "next/server";
import { loadAppConfig } from "@/lib/config";
import { throwHttpError } from "@/lib/http";
import { ForbiddenError, UnauthorizedError } from "./errors";
import {
  SESSION_COOKIE_NAME,
  verifyBearerToken,
  verifySessionCookie,
} from "./token";

export async function requireAuthenticatedContext(request: NextRequest) {
  const config = loadAppConfig();
  const authorizationHeader = request.headers.get("authorization") ?? "";
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  try {
    const user =
      config.runMode === "cloud"
        ? await verifySessionCookie(config, sessionCookie)
        : await verifyBearerToken(config, authorizationHeader);
    return { config, user };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throwHttpError(error.status, error.message);
    }
    throw error;
  }
}
