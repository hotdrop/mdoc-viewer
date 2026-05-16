import type { ChatRequest, ChatResponse } from "@/types/chat";

export async function postChatMessage({
  message,
}: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Chat API 呼び出しに失敗しました。");
  }

  return (await response.json()) as ChatResponse;
}
