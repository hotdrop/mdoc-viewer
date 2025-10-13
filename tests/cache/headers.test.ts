import { describe, expect, it } from "vitest";
import {
  applyCacheHeaders,
  formatEtag,
  shouldReturnNotModified,
} from "@/lib/cache/headers";

describe("cache headers", () => {
  it("formats weak etag with quotes", () => {
    expect(formatEtag("12345")).toBe('"12345"');
  });

  it("detects not modified when etag matches", () => {
    const headers = new Headers({ "if-none-match": '"abc"' });
    const result = shouldReturnNotModified(headers, {
      etag: "abc",
      lastModified: new Date(),
    });
    expect(result).toBe(true);
  });

  it("applies cache headers correctly", () => {
    const responseHeaders = new Headers();
    const lastModified = new Date("2024-01-01T00:00:00Z");
    applyCacheHeaders(responseHeaders, {
      etag: "abc",
      lastModified,
    });
    expect(responseHeaders.get("etag")).toBe('"abc"');
    expect(responseHeaders.get("last-modified")).toBe(lastModified.toUTCString());
    expect(responseHeaders.get("cache-control")).toContain("max-age=60");
  });
});
