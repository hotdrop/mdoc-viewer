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
    reason,
  });
}
