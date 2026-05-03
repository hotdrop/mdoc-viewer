import { headers } from "next/headers";
import { ReactNode } from "react";
import { loadAppConfig } from "@/lib/config";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/errors";
import { verifyBearerToken, type AuthenticatedUser } from "@/lib/auth/token";
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
  const config = loadAppConfig();
  const authorizationHeader = requestHeaders.get("authorization") ?? "";

  let authenticatedUser: AuthenticatedUser | null = null;

  try {
    authenticatedUser = await verifyBearerToken(
      config,
      authorizationHeader,
    );

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
          bearerToken: authorizationHeader,
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
        reason: error.message,
      });
      throwHttpError(error.status, error.message);
    }
    logAccess({
      user: authenticatedUser,
      path: requestHeaders.get("x-invoke-path") ?? "unknown",
      status: 500,
      mode: config.runMode,
      route: "(protected)/layout",
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    throw error;
  }
}
