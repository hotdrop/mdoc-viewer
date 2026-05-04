"use client";

import { useState } from "react";
import Link from "next/link";
import type { ViewerAdjacentLink } from "@/lib/viewer/navigation";

type ViewerDocumentActionsProps = {
  previous?: ViewerAdjacentLink;
  next?: ViewerAdjacentLink;
  searchHref: string;
};

export function ViewerDocumentActions({
  previous,
  next,
  searchHref,
}: ViewerDocumentActionsProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      setCopyStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}`,
      );
      setCopyStatus("success");
      window.setTimeout(() => setCopyStatus("idle"), 2500);
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdjacentDocumentLink direction="previous" document={previous} />
        <AdjacentDocumentLink direction="next" document={next} />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-700 px-3 py-2 text-left text-sm font-medium text-slate-200 transition hover:border-cyan-700 hover:text-cyan-200"
        >
          このページのリンクをコピー
        </button>
        <Link
          href={searchHref}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-700 hover:text-cyan-200"
        >
          検索へ戻る
        </Link>
      </div>
      <p
        className="mt-3 min-h-5 text-xs text-slate-400"
        role="status"
        aria-live="polite"
      >
        {copyStatus === "success" ? "リンクをコピーしました。" : null}
        {copyStatus === "error"
          ? "リンクをコピーできませんでした。ブラウザの権限を確認してください。"
          : null}
      </p>
    </section>
  );
}

function AdjacentDocumentLink({
  direction,
  document,
}: {
  direction: "previous" | "next";
  document?: ViewerAdjacentLink;
}) {
  const label = direction === "previous" ? "前のドキュメント" : "次のドキュメント";

  if (!document) {
    return (
      <span className="rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-600">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={document.href}
      className="rounded-md border border-slate-700 px-3 py-2 text-sm transition hover:border-cyan-700 hover:text-cyan-200"
    >
      <span className="block text-xs text-slate-500">{label}</span>
      <span className="block truncate font-medium text-slate-200">
        {document.label}
      </span>
    </Link>
  );
}
