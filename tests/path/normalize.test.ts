import { describe, expect, it } from "vitest";
import {
  normalizeDocPath,
  resolveRelativeDocPath,
  toViewerPathFromRelativePath,
} from "@/lib/path";

describe("normalizeDocPath", () => {
  it("uses index.txt for root path", () => {
    const result = normalizeDocPath([]);
    expect(result.relativePath).toBe("index.txt");
    expect(result.viewerPath).toBe("/viewer/index");
  });

  it("adds index.txt for directory path", () => {
    const result = normalizeDocPath(["guide"]);
    expect(result.relativePath).toBe("guide/index.txt");
    expect(result.viewerPath).toBe("/viewer/guide");
  });

  it("normalizes explicit directory index files to the directory viewer path", () => {
    const result = normalizeDocPath(["mobileapp", "index"]);
    expect(result.relativePath).toBe("mobileapp/index.txt");
    expect(result.viewerPath).toBe("/viewer/mobileapp");
  });

  it("rejects path traversal", () => {
    expect(() => normalizeDocPath(["..", "secret"])).toThrowError(
      "許可されていないパスです。",
    );
  });

  it("ensures .txt extension", () => {
    const result = normalizeDocPath("policies/security");
    expect(result.relativePath).toBe("policies/security.txt");
    expect(result.viewerPath).toBe("/viewer/policies/security");
  });

  it("builds public viewer paths for index documents in document lists", () => {
    expect(toViewerPathFromRelativePath("mobileapp/index.txt")).toBe(
      "/viewer/mobileapp",
    );
    expect(toViewerPathFromRelativePath("mobileapp/setup.txt")).toBe(
      "/viewer/mobileapp/setup",
    );
  });
});

describe("resolveRelativeDocPath", () => {
  it("resolves nested relative path", () => {
    const result = resolveRelativeDocPath("guide/index.txt", "./intro");
    expect(result.relativePath).toBe("guide/intro.txt");
  });

  it("prevents escaping root", () => {
    expect(() =>
      resolveRelativeDocPath("guide/index.txt", "../../etc/passwd"),
    ).toThrowError("許可されていないパスです。");
  });
});
