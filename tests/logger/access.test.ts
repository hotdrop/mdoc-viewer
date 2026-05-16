import { afterEach, describe, expect, it, vi } from "vitest";
import { logAccess } from "@/lib/logger/access";

describe("logAccess", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("許可されていない reason は固定コードに置き換える", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    logAccess({
      user: { uid: "user-1", email: "user@example.co.jp", tokenIssuedAt: 0 },
      path: "/docs/secret",
      status: 500,
      mode: "cloud",
      route: "/docs/[...path]",
      reason: "raw bucket error",
    });

    const entry = JSON.parse(String(consoleError.mock.calls[0]?.[0])) as {
      reason: string;
    };
    expect(entry.reason).toBe("unknown_error");
  });

  it("許可された reason はそのまま出力する", () => {
    const consoleWarn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    logAccess({
      user: null,
      path: "/docs/missing",
      status: 404,
      mode: "cloud",
      route: "/docs/[...path]",
      reason: "document_not_found",
    });

    const entry = JSON.parse(String(consoleWarn.mock.calls[0]?.[0])) as {
      reason: string;
    };
    expect(entry.reason).toBe("document_not_found");
  });
});
