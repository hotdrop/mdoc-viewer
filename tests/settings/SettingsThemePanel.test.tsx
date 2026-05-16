/* @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SettingsThemePanel } from "@/app/(protected)/settings/SettingsThemePanel";
import { THEME_STORAGE_KEY } from "@/lib/theme/preferences";

describe("SettingsThemePanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "dark";
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.dataset.theme = "dark";
  });

  it("初期値は dark になり、バージョンを表示する", () => {
    render(<SettingsThemePanel appVersion="0.1.0" />);

    expect((screen.getByRole("radio", { name: /ダーク/ }) as HTMLInputElement).checked).toBe(
      true,
    );
    expect(screen.getByText("0.1.0")).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("ライト選択で data-theme と保存値を更新する", () => {
    render(<SettingsThemePanel appVersion="0.1.0" />);

    fireEvent.click(screen.getByRole("radio", { name: /ライト/ }));

    expect((screen.getByRole("radio", { name: /ライト/ }) as HTMLInputElement).checked).toBe(
      true,
    );
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("ダーク選択で data-theme と保存値を更新する", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<SettingsThemePanel appVersion="0.1.0" />);

    fireEvent.click(screen.getByRole("radio", { name: /ダーク/ }));

    expect((screen.getByRole("radio", { name: /ダーク/ }) as HTMLInputElement).checked).toBe(
      true,
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
