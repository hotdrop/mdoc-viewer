"use client";

import { useEffect } from "react";
import { readThemePreference } from "@/lib/theme/preferences";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = readThemePreference();
  }, []);

  return children;
}
