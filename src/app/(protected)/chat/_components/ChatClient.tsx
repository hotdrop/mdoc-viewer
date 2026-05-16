"use client";

import React, { useState } from "react";
import { postChatMessage } from "@/lib/chat/client";
import type { ChatMessage } from "@/types/chat";
import { ChatInputForm } from "./ChatInputForm";
import { ChatMessageList } from "./ChatMessageList";

const CHAT_ERROR_MESSAGE =
  "回答の取得に失敗しました。時間をおいて再度お試しください。";

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (message: string) => {
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await postChatMessage({
        message,
      });
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
        references: response.references,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: CHAT_ERROR_MESSAGE,
      };
      setMessages((current) => [...current, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-13rem)] flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <ChatInputForm isLoading={isLoading} onSubmit={handleSubmit} />
    </section>
  );
}

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
