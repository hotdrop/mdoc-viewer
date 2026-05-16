import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  readThemePreference,
  saveThemePreference,
} from "@/lib/theme/preferences";

describe("theme preferences", () => {
  it("dark と light を保存して読み込める", () => {
    const storage = createStorage();

    expect(saveThemePreference("light", storage)).toBe("light");
    expect(readThemePreference(storage)).toBe("light");

    expect(saveThemePreference("dark", storage)).toBe("dark");
    expect(readThemePreference(storage)).toBe("dark");
  });

  it("不正な保存値は既定値として扱い、保存値を削除する", () => {
    const storage = createStorage();
    storage.setItem(THEME_STORAGE_KEY, "{invalid");

    expect(readThemePreference(storage)).toBe(DEFAULT_THEME);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("空値は既定値として扱う", () => {
    const storage = createStorage();

    expect(readThemePreference(storage)).toBe(DEFAULT_THEME);
  });

  it("localStorage が利用できない場合も例外を出さない", () => {
    expect(readThemePreference(undefined)).toBe(DEFAULT_THEME);
    expect(saveThemePreference("light", undefined)).toBe("light");
  });

  it("localStorage アクセスが失敗しても既定値に戻す", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: () => {
        throw new Error("storage unavailable");
      },
      removeItem: () => {
        throw new Error("storage unavailable");
      },
    } as Storage;

    expect(readThemePreference(storage)).toBe(DEFAULT_THEME);
    expect(saveThemePreference("dark", storage)).toBe("dark");
  });
});

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  } as Storage;
}
