import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE_NAME } from "@/lib/auth/token";

const getFirebaseAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/firebaseAdmin", () => ({
  getFirebaseAuth: getFirebaseAuthMock,
}));

vi.mock("@/lib/logger", () => ({
  logAccess: vi.fn(),
}));

describe("POST /api/session", () => {
  const authMock = {
    verifyIdToken: vi.fn(),
    createSessionCookie: vi.fn(),
  };

  beforeEach(() => {
    vi.resetModules();
    getFirebaseAuthMock.mockReturnValue(authMock);
    authMock.verifyIdToken.mockReset();
    authMock.createSessionCookie.mockReset();
    process.env.RUN_MODE = "cloud";
    process.env.ALLOWED_DOMAIN = "example.co.jp";
    process.env.FIREBASE_PROJECT_ID = "demo-project";
    process.env.FIREBASE_WEB_API_KEY = "demo-key";
    process.env.GCP_PROJECT_ID = "demo-project";
    process.env.GCS_BUCKET = "demo-bucket";
  });

  it("有効な ID token で session cookie を発行する", async () => {
    authMock.verifyIdToken.mockResolvedValue({
      uid: "user-1",
      email: "user@example.co.jp",
      email_verified: true,
      iat: 100,
    });
    authMock.createSessionCookie.mockResolvedValue("session-cookie-value");
    const { POST } = await import("@/app/api/session/route");

    const response = await POST(createSessionRequest("id-token"));

    expect(response.status).toBe(204);
    expect(authMock.verifyIdToken).toHaveBeenCalledWith("id-token", true);
    expect(response.headers.get("set-cookie")).toContain(
      `${SESSION_COOKIE_NAME}=session-cookie-value`,
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });

  it("許可ドメイン以外は 403 を返す", async () => {
    authMock.verifyIdToken.mockResolvedValue({
      uid: "user-1",
      email: "user@example.com",
      email_verified: true,
      iat: 100,
    });
    const { POST } = await import("@/app/api/session/route");

    const response = await POST(createSessionRequest("id-token"));

    expect(response.status).toBe(403);
    expect(authMock.createSessionCookie).not.toHaveBeenCalled();
  });

  it("壊れた token は 401 を返す", async () => {
    authMock.verifyIdToken.mockRejectedValue(new Error("invalid token"));
    const { POST } = await import("@/app/api/session/route");

    const response = await POST(createSessionRequest("broken-token"));

    expect(response.status).toBe(401);
    expect(authMock.createSessionCookie).not.toHaveBeenCalled();
  });
});

function createSessionRequest(idToken: string): NextRequest {
  return new NextRequest("https://docs.example.co.jp/api/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });
}
