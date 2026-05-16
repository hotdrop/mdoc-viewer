import React from "react";
import ChatClient from "./_components/ChatClient";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">ドキュメントチャット</h1>
        <p className="text-sm text-slate-400">
          ドキュメント内容について質問し、回答の参照元を確認できます。
        </p>
      </header>
      <ChatClient />
    </main>
  );
}
