"use client";

import React from "react";
import type { ChatMessage } from "@/types/chat";
import { ChatMessageItem } from "./ChatMessageItem";

type ChatMessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
};

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      {messages.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950/30 px-4 text-center text-sm text-slate-400">
          質問を入力すると、この画面に会話が表示されます。
        </div>
      ) : (
        <ul className="space-y-5">
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </ul>
      )}

      {isLoading && (
        <div className="mt-5 flex justify-start">
          <div
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300"
            role="status"
          >
            回答を生成中です…
          </div>
        </div>
      )}
    </div>
  );
}
