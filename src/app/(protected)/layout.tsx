import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { loadAppConfig } from "@/lib/config";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/errors";
import {
  SESSION_COOKIE_NAME,
  verifyBearerToken,
  verifySessionCookie,
  type AuthenticatedUser,
} from "@/lib/auth/token";
import { throwHttpError } from "@/lib/http";
import { logAccess } from "@/lib/logger";
import { AppHeader } from "./_components/AppHeader";
import { AuthProvider } from "./_components/AuthProvider";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const config = loadAppConfig();
  const authorizationHeader = requestHeaders.get("authorization") ?? "";
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  let authenticatedUser: AuthenticatedUser | null = null;

  try {
    authenticatedUser =
      config.runMode === "cloud"
        ? await verifySessionCookie(config, sessionCookie)
        : await verifyBearerToken(config, authorizationHeader);

    const path =
      requestHeaders.get("x-invoke-path") ??
      requestHeaders.get("x-pathname") ??
      requestHeaders.get("referer") ??
      "unknown";

    logAccess({
      user: authenticatedUser,
      path,
      status: 200,
      mode: config.runMode,
      route: "(protected)/layout",
    });

    return (
      <AuthProvider
        value={{
          user: authenticatedUser,
          runMode: config.runMode,
        }}
      >
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          {children}
        </div>
      </AuthProvider>
    );
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      logAccess({
        user: null,
        path: requestHeaders.get("x-invoke-path") ?? "unknown",
        status: error.status,
        mode: config.runMode,
        route: "(protected)/layout",
        reason:
          error instanceof UnauthorizedError ? "auth_missing" : "auth_forbidden",
      });
      if (error instanceof UnauthorizedError) {
        redirect(config.runMode === "cloud" ? "/login" : "/local-login");
      }
      throwHttpError(error.status, error.message);
    }
    logAccess({
      user: authenticatedUser,
      path: requestHeaders.get("x-invoke-path") ?? "unknown",
      status: 500,
      mode: config.runMode,
      route: "(protected)/layout",
      reason: "unknown_error",
    });
    throw error;
  }
}
