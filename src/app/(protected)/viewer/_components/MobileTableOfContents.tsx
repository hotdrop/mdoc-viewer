"use client";

import { useState } from "react";
import { TableOfContents } from "@/components/TableOfContents";
import type { TocItem } from "@/lib/md/renderer";

type MobileTableOfContentsProps = {
  toc: TocItem[];
};

export function MobileTableOfContents({ toc }: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-left text-sm font-medium text-slate-100"
      >
        目次
        <span className="float-right text-slate-500">
          {isOpen ? "閉じる" : "開く"}
        </span>
      </button>
      {isOpen ? (
        <div className="mt-3">
          <TableOfContents toc={toc} />
        </div>
      ) : null}
    </div>
  );
}
