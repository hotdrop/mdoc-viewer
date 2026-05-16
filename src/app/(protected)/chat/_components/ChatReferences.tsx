"use client";

import React from "react";
import Link from "next/link";
import type { ChatReference } from "@/types/chat";

type ChatReferencesProps = {
  references: ChatReference[];
};

export function ChatReferences({ references }: ChatReferencesProps) {
  return (
    <div className="mt-4 border-t border-slate-800 pt-3">
      <p className="mb-2 text-xs font-semibold text-slate-400">参照元</p>
      <ul className="space-y-2">
        {references.map((reference) => (
          <li key={`${reference.title}-${reference.url}`}>
            <Link
              href={reference.url}
              className="inline-flex max-w-full flex-col gap-1 rounded border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-cyan-200 transition hover:border-cyan-700 hover:text-cyan-100"
            >
              <span className="font-medium">{reference.title}</span>
              <span className="break-all text-xs text-slate-400">
                {reference.url}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
