import type { RunMode } from "@/lib/config";
import type { AuthenticatedUser } from "@/lib/auth";
import { logStructured } from "./structured";

type AccessLogParams = {
  user: AuthenticatedUser | null;
  path: string;
  status: number;
  mode: RunMode;
  route: string;
  reason?: string;
};

const SAFE_REASONS = new Set([
  "auth_missing",
  "auth_forbidden",
  "document_not_found",
  "empty_message",
  "repository_error",
  "unknown_error",
]);

export function logAccess({
  user,
  path,
  status,
  mode,
  route,
  reason,
}: AccessLogParams): void {
  logStructured(status >= 500 ? "error" : status >= 400 ? "warn" : "info", {
    uid: user?.uid,
    path,
    status,
    mode,
    route,
    reason: sanitizeReason(reason),
  });
}

function sanitizeReason(reason?: string): string | undefined {
  if (!reason) {
    return undefined;
  }
  if (SAFE_REASONS.has(reason)) {
    return reason;
  }
  return "unknown_error";
}
