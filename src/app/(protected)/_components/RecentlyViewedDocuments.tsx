"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/datetime/format";
import {
  readRecentlyViewedDocuments,
  type RecentlyViewedDocument,
} from "@/lib/viewer/recentlyViewed";

export function RecentlyViewedDocuments() {
  const [documents, setDocuments] = useState<RecentlyViewedDocument[]>([]);

  useEffect(() => {
    setDocuments(readRecentlyViewedDocuments());
  }, []);

  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">最近見たドキュメント</h2>
        <p className="text-sm text-slate-400">
          このブラウザで最近開いたドキュメントです。
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {documents.map((document) => (
          <li
            key={document.viewerPath}
            className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 transition hover:border-slate-600"
          >
            <Link
              href={document.viewerPath}
              className="block space-y-2 text-slate-100 hover:text-cyan-300"
            >
              <span className="block truncate text-sm font-medium">
                {document.title}
              </span>
              <span className="block text-xs text-slate-500">
                閲覧日時: {formatDateTime(new Date(document.viewedAt))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
