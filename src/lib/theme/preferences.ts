export const THEME_STORAGE_KEY = "md-doc-viewer:theme";
export const DEFAULT_THEME = "dark";

export type ThemePreference = "dark" | "light";

type ThemeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readThemePreference(
  storage = getThemeStorage(),
): ThemePreference {
  if (!storage) return DEFAULT_THEME;

  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    if (raw === "dark" || raw === "light") {
      return raw;
    }
    if (raw !== null) {
      storage.removeItem(THEME_STORAGE_KEY);
    }
  } catch {
    return DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function saveThemePreference(
  theme: ThemePreference,
  storage = getThemeStorage(),
): ThemePreference {
  if (!storage) return theme;

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return theme;
  }

  return theme;
}

function getThemeStorage(): ThemeStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
