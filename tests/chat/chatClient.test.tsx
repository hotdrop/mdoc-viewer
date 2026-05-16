/* @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChatClient from "@/app/(protected)/chat/_components/ChatClient";
import { AuthProvider } from "@/app/(protected)/_components/AuthProvider";

describe("ChatClient", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("空文字または空白のみでは送信できない", () => {
    renderChatClient();

    const button = screen.getByRole("button", { name: "送信" }) as HTMLButtonElement;
    const input = screen.getByLabelText("質問本文");

    expect(button.disabled).toBe(true);

    fireEvent.change(input, { target: { value: "   " } });

    expect(button.disabled).toBe(true);
  });

  it("送信成功時にユーザーメッセージ、AI回答、参照元リンクを表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: "ダミー回答です。",
          references: [{ title: "サンプル仕様書", url: "/viewer/sample" }],
        }),
      }),
    );
    renderChatClient();

    fireEvent.change(screen.getByLabelText("質問本文"), {
      target: { value: "セキュリティ要件は？" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.getByText("セキュリティ要件は？")).toBeTruthy();
    expect(screen.getByText("回答を生成中です…")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("ダミー回答です。")).toBeTruthy();
    });

    const fetchMock = fetch as ReturnType<typeof vi.fn>;
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
      "content-type": "application/json",
    });

    const referenceLink = screen.getByRole("link", { name: /サンプル仕様書/ });
    expect(referenceLink.getAttribute("href")).toBe("/viewer/sample");
  });

  it("回答取得中は入力欄と送信ボタンを無効化する", async () => {
    let resolveFetch: (value: unknown) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );
    renderChatClient();

    fireEvent.change(screen.getByLabelText("質問本文"), {
      target: { value: "検索との違いは？" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect((screen.getByLabelText("質問本文") as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "送信" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    resolveFetch({
      ok: true,
      json: async () => ({ answer: "回答", references: [] }),
    });

    await waitFor(() => {
      expect((screen.getByLabelText("質問本文") as HTMLTextAreaElement).disabled).toBe(false);
    });
  });

  it("API失敗時にエラーメッセージを表示し、再送信可能に戻す", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "error" }),
      }),
    );
    renderChatClient();

    fireEvent.change(screen.getByLabelText("質問本文"), {
      target: { value: "失敗ケース" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(
        screen.getByText("回答の取得に失敗しました。時間をおいて再度お試しください。"),
      ).toBeTruthy();
    });

    const input = screen.getByLabelText("質問本文") as HTMLTextAreaElement;
    expect(input.disabled).toBe(false);
    fireEvent.change(input, { target: { value: "もう一度" } });
    expect((screen.getByRole("button", { name: "送信" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });
});

function renderChatClient() {
  return render(
    <AuthProvider
      value={{
        user: {
          uid: "test-user",
          email: "user@example.co.jp",
          tokenIssuedAt: 0,
        },
        runMode: "local",
      }}
    >
      <ChatClient />
    </AuthProvider>,
  );
}
