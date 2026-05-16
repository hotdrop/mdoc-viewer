"use client";

import React, { FormEvent, useMemo, useState } from "react";

type ChatInputFormProps = {
  isLoading: boolean;
  onSubmit: (message: string) => Promise<void>;
};

export function ChatInputForm({ isLoading, onSubmit }: ChatInputFormProps) {
  const [message, setMessage] = useState("");
  const trimmedMessage = useMemo(() => message.trim(), [message]);
  const isSubmitDisabled = isLoading || trimmedMessage.length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;
    const nextMessage = trimmedMessage;
    setMessage("");
    await onSubmit(nextMessage);
  };

  return (
    <form
      className="border-t border-slate-800 bg-slate-950/40 p-4"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="sr-only" htmlFor="chat-message">
          質問本文
        </label>
        <textarea
          id="chat-message"
          className="min-h-24 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-base leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="ドキュメントについて質問する"
          value={message}
          disabled={isLoading}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:w-28"
          disabled={isSubmitDisabled}
        >
          送信
        </button>
      </div>
    </form>
  );
}
