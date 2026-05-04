import { describe, expect, it } from "vitest";
import { buildViewerResultHref } from "@/lib/search/viewerLinks";

describe("buildViewerResultHref", () => {
  it("検索語が空の場合は元の viewer href を返す", () => {
    expect(buildViewerResultHref("/viewer/guide/intro", " ")).toBe(
      "/viewer/guide/intro",
    );
  });

  it("検索語を searchQuery として付与する", () => {
    expect(buildViewerResultHref("/viewer/guide/intro", "運用 手順")).toBe(
      "/viewer/guide/intro?searchQuery=%E9%81%8B%E7%94%A8%20%E6%89%8B%E9%A0%86",
    );
  });

  it("ハッシュ付き href ではクエリをハッシュの前に置く", () => {
    expect(buildViewerResultHref("/viewer/guide/intro#setup", "設定")).toBe(
      "/viewer/guide/intro?searchQuery=%E8%A8%AD%E5%AE%9A#setup",
    );
  });
});
