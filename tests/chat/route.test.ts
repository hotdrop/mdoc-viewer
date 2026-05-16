import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthenticatedContextMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  requireAuthenticatedContext: requireAuthenticatedContextMock,
}));

vi.mock("@/lib/logger", () => ({
  logAccess: vi.fn(),
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAuthenticatedContextMock.mockReset();
    requireAuthenticatedContextMock.mockResolvedValue({
      config: { runMode: "local" },
      user: {
        uid: "test-user",
        email: "user@example.co.jp",
        emailVerified: true,
      },
    });
  });

  it("認証済みリクエストに正常レスポンスを返す", async () => {
    const { POST } = await import("@/app/(protected)/api/chat/route");

    const response = await POST(createJsonRequest({ message: "質問です" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.answer).toContain("これはダミー回答です。");
    expect(body.references).toEqual([
      {
        title: "サンプル仕様書",
        url: "/viewer/sample",
      },
    ]);
  });

  it("空メッセージは400を返す", async () => {
    const { POST } = await import("@/app/(protected)/api/chat/route");

    const response = await POST(createJsonRequest({ message: "   " }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: "質問本文を入力してください。" });
  });

  it("成功レスポンスに共通セキュリティヘッダとVaryを付与する", async () => {
    const { POST } = await import("@/app/(protected)/api/chat/route");

    const response = await POST(createJsonRequest({ message: "ヘッダ確認" }));

    expect(response.headers.get("content-security-policy")).toContain("script-src 'self'");
    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(response.headers.get("content-security-policy")).toContain("connect-src 'self'");
    expect(response.headers.get("content-security-policy")).toContain("form-action 'self'");
    expect(response.headers.get("content-security-policy")).toContain("img-src 'self' data:");
    expect(response.headers.get("content-security-policy")).toContain("base-uri 'none'");
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("content-security-policy")).toContain("object-src 'none'");
    expect(response.headers.get("vary")).toBe("Cookie, Authorization");
  });
});

function createJsonRequest(payload: unknown): NextRequest {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: {
      authorization: "Bearer test-token",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
