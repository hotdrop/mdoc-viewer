import type { ChatRequest, ChatResponse } from "@/types/chat";

export async function getChatAnswer(request: ChatRequest): Promise<ChatResponse> {
  void request;

  return {
    answer:
      "これはダミー回答です。将来的にはRAG Core APIから取得した回答を表示します。",
    references: [
      {
        title: "サンプル仕様書",
        url: "/viewer/sample",
      },
    ],
  };
}
