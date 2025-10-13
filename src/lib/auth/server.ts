import type { NextRequest } from "next/server";
import { loadAppConfig } from "@/lib/config";
import { throwHttpError } from "@/lib/http";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { verifyBearerToken } from "./token";

export async function requireAuthenticatedContext(request: NextRequest) {
  const config = loadAppConfig();
  const authorizationHeader = request.headers.get("authorization") ?? "";
  try {
    const user = await verifyBearerToken(
      config,
      authorizationHeader,
    );
    return { config, user, authorizationHeader };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throwHttpError(error.status, error.message);
    }
    throw error;
  }
}
