import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/md/renderer";

describe("renderMarkdown", () => {
  it("sanitizes javascript links", async () => {
    const { html } = await renderMarkdown(
      "[xss](javascript:alert('x'))",
      { currentRelativePath: "docs/index.txt" },
    );
    expect(html).not.toContain("javascript:");
  });

  it("strips unsupported link protocols", async () => {
    const { html } = await renderMarkdown("[ftp](ftp://example.com/file)", {
      currentRelativePath: "docs/index.txt",
    });
    expect(html).not.toContain("ftp://");
  });

  it("strips img tags", async () => {
    const { html } = await renderMarkdown("![](https://example.com/img.png)", {
      currentRelativePath: "docs/index.txt",
    });
    expect(html).not.toContain("<img");
  });

  it("matches snapshot for complex markdown", async () => {
    const source = `# Title\n\n- list item\n\n\n<script>alert('bad')</script>`;
    const result = await renderMarkdown(source, {
      currentRelativePath: "docs/index.txt",
    });
    const expectedHtml = `<h1 id="md-title"><a href="#md-title" class="heading-anchor">Title</a></h1>
<ul>
<li>list item</li>
</ul>`;
    expect(result.html).toBe(expectedHtml);
  });

  it("keeps sanitized heading ids aligned with anchors and toc", async () => {
    const result = await renderMarkdown("## Location", {
      currentRelativePath: "docs/index.txt",
    });

    expect(result.html).toContain('id="md-location"');
    expect(result.html).toContain('href="#md-location"');
    expect(result.toc).toEqual([
      {
        id: "md-location",
        title: "Location",
        depth: 2,
      },
    ]);
  });
});
