import { describe, expect, it } from "vitest";
import { TOP_DOCUMENT_PATH } from "@/lib/constants";

describe("document constants", () => {
  it("uses index.txt as the fixed top page document", () => {
    expect(TOP_DOCUMENT_PATH).toBe("index.txt");
  });
});
