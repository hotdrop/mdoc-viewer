"use client";

import React from "react";
import type { ChatMessage } from "@/types/chat";
import { ChatReferences } from "./ChatReferences";

type ChatMessageItemProps = {
  message: ChatMessage;
};

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`max-w-[min(42rem,85%)] rounded-lg border px-4 py-3 ${
          isUser
            ? "border-cyan-900/50 bg-cyan-500/15 text-slate-100"
            : "border-slate-800 bg-slate-950/70 text-slate-200"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-7">
          {message.content}
        </p>
        {!isUser && message.references && message.references.length > 0 && (
          <ChatReferences references={message.references} />
        )}
      </article>
    </li>
  );
}
