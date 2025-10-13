import { describe, expect, it } from "vitest";
import {
  normalizeDocPath,
  resolveRelativeDocPath,
} from "@/lib/path";

describe("normalizeDocPath", () => {
  it("adds index.txt for directory path", () => {
    const result = normalizeDocPath(["guide"]);
    expect(result.relativePath).toBe("guide/index.txt");
    expect(result.viewerPath).toBe("/viewer/guide/index");
  });

  it("rejects path traversal", () => {
    expect(() => normalizeDocPath(["..", "secret"])).toThrowError(
      "許可されていないパスです。",
    );
  });

  it("ensures .txt extension", () => {
    const result = normalizeDocPath("policies/security");
    expect(result.relativePath).toBe("policies/security.txt");
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
