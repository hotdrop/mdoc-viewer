export type ChatReference = {
  title: string;
  url: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: ChatReference[];
};

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  answer: string;
  references: ChatReference[];
};
