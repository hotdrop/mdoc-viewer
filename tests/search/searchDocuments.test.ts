import { describe, expect, it } from "vitest";
import { searchDocuments, buildSnippet } from "@/lib/search/searchDocuments";
import type { SearchDocument } from "@/types/search";

const documents: SearchDocument[] = [
  {
    relativePath: "guides/setup-local.txt",
    viewerPath: "/viewer/guides/setup-local",
    title: "ローカル開発環境",
    updatedAt: "2026-04-01T00:00:00.000Z",
    excerpt: "Firebase Emulator を使ったローカル環境の手順です。",
    headings: [{ title: "Firebase Emulator の起動", id: "firebase-emulator-の起動" }],
    bodyText: "ローカルでは Firebase Emulator を起動してから pnpm dev を実行します。",
  },
  {
    relativePath: "reference/firebase-emulator.txt",
    viewerPath: "/viewer/reference/firebase-emulator",
    title: "Firebase Emulator",
    updatedAt: "2026-04-02T00:00:00.000Z",
    excerpt: "認証エミュレータの概要です。",
    headings: [{ title: "概要", id: "概要" }],
    bodyText: "ローカルログインで利用する認証エミュレータについて説明します。",
  },
];

describe("searchDocuments", () => {
  it("prioritizes title matches over body matches", () => {
    const results = searchDocuments(documents, "Firebase Emulator", 10);

    expect(results[0]?.relativePath).toBe("reference/firebase-emulator.txt");
    expect(results[0]?.matchedField).toBe("title");
  });

  it("links directly to matched headings", () => {
    const results = searchDocuments(documents, "起動", 10);
    const headingResult = results.find(
      (result) => result.relativePath === "guides/setup-local.txt",
    );

    expect(headingResult?.matchedField).toBe("heading");
    expect(headingResult?.targetHref).toBe(
      "/viewer/guides/setup-local#firebase-emulator-の起動",
    );
  });

  it("returns snippets around body matches", () => {
    const results = searchDocuments(documents, "pnpm dev", 10);
    const result = results.find(
      (item) => item.relativePath === "guides/setup-local.txt",
    );

    expect(result?.matchedField).toBe("body");
    expect(result?.snippet).toContain("pnpm dev");
  });

  it("keeps unsafe markup as plain snippet text", () => {
    const snippet = buildSnippet(
      "リンク javascript:alert(1) と <script>alert('x')</script> は表示用文字列です。",
      { indices: [[4, 13]] },
    );

    expect(snippet).toContain("javascript:");
    expect(snippet).toContain("<script>");
  });
});
