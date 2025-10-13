"use client";

import { createContext, useContext } from "react";
import type { AuthenticatedUser } from "@/lib/auth/token";
import type { RunMode } from "@/lib/config";

export type AuthContextValue = {
  user: AuthenticatedUser;
  runMode: RunMode;
  bearerToken: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProvider の外で useAuth が呼ばれました。");
  }
  return context;
}
