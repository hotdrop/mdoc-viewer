"use client";

import React, { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  type ThemePreference,
  readThemePreference,
  saveThemePreference,
} from "@/lib/theme/preferences";

type SettingsThemePanelProps = {
  appVersion: string;
};

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    value: "dark",
    label: "ダーク",
    description: "現在の暗い背景を基準に表示します。",
  },
  {
    value: "light",
    label: "ライト",
    description: "明るい背景でドキュメントを表示します。",
  },
];

export function SettingsThemePanel({ appVersion }: SettingsThemePanelProps) {
  const [theme, setTheme] = useState<ThemePreference>(DEFAULT_THEME);

  useEffect(() => {
    const savedTheme = readThemePreference();
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  const handleThemeChange = (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    saveThemePreference(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-6 space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">表示テーマ</h2>
          <p className="text-sm text-slate-400">
            このブラウザで使用する表示テーマを選択します。
          </p>
        </header>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">表示テーマ</legend>
          {themeOptions.map((option) => {
            const isSelected = theme === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-slate-800 bg-slate-950/40 hover:border-cyan-700"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleThemeChange(option.value)}
                  className="sr-only"
                />
                <span className="block text-base font-semibold text-slate-100">
                  {option.label}
                </span>
                <span className="mt-2 block text-sm text-slate-400">
                  {option.description}
                </span>
              </label>
            );
          })}
        </fieldset>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-slate-100">アプリ情報</h2>
        </header>
        <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
          <dt className="text-slate-400">バージョン</dt>
          <dd className="font-medium text-slate-100">{appVersion}</dd>
        </dl>
      </section>
    </div>
  );
}
