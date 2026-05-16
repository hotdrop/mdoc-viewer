import type { ChatRequest, ChatResponse } from "@/types/chat";

export async function postChatMessage({
  message,
  bearerToken,
}: ChatRequest & {
  bearerToken: string;
}): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(bearerToken ? { authorization: bearerToken } : {}),
    },
    cache: "no-store",
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Chat API 呼び出しに失敗しました。");
  }

  return (await response.json()) as ChatResponse;
}
