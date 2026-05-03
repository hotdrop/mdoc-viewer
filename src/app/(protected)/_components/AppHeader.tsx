"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "トップ" },
  { href: "/search", label: "検索" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="min-w-0 truncate text-sm font-semibold text-slate-100 transition hover:text-cyan-200 sm:text-base"
        >
          ドキュメントビューア
        </Link>
        <nav aria-label="グローバルナビゲーション" className="flex shrink-0 items-center gap-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-200"
                    : "text-slate-300 hover:text-cyan-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
