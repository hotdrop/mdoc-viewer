import { describe, expect, it } from "vitest";
import { buildSearchBodyText, parseMarkdown, slugHeading } from "@/lib/repo/utils";

describe("parseMarkdown search metadata", () => {
  it("builds plain body text without markdown noise", () => {
    const bodyText = buildSearchBodyText(`
## セットアップ

- [Firebase Emulator](./setup-local) を起動します。
- \`pnpm dev\` を実行します。

\`\`\`bash
SECRET_VALUE=hidden pnpm dev
\`\`\`
`);

    expect(bodyText).toContain("セットアップ");
    expect(bodyText).toContain("Firebase Emulator を起動します");
    expect(bodyText).toContain("pnpm dev を実行します");
    expect(bodyText).not.toContain("SECRET_VALUE");
    expect(bodyText).not.toContain("[Firebase Emulator]");
  });

  it("extracts h2 and h3 headings with stable anchor ids", () => {
    const parsed = parseMarkdown(`
# API Overview
## API Overview
### API Overview
## セットアップ
`);

    expect(parsed.headings).toEqual([
      { title: "API Overview", id: "api-overview-1" },
      { title: "API Overview", id: "api-overview-2" },
      { title: "セットアップ", id: "セットアップ" },
    ]);
  });

  it("slugifies headings similarly to rehype-slug for supported content", () => {
    expect(slugHeading("API Overview")).toBe("api-overview");
    expect(slugHeading("Cache: ETag / 304")).toBe("cache-etag--304");
  });
});
