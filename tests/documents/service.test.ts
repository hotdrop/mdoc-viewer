import { describe, expect, it } from "vitest";
import { buildDocumentTree } from "@/lib/documents/service";
import type { IndexableDocument } from "@/types/document";

describe("buildDocumentTree", () => {
  it("uses directory index documents as clickable directory entries", () => {
    const tree = buildDocumentTree([
      createIndexableDocument({
        relativePath: "mobileapp/index.txt",
        viewerPath: "/viewer/mobileapp",
        title: "Mobile App",
      }),
      createIndexableDocument({
        relativePath: "mobileapp/setup.txt",
        viewerPath: "/viewer/mobileapp/setup",
        title: "セットアップ",
      }),
      createIndexableDocument({
        relativePath: "server/index.txt",
        viewerPath: "/viewer/server",
        title: "",
      }),
    ]);

    expect(tree).toEqual([
      {
        label: "Mobile App",
        path: "mobileapp",
        href: "/viewer/mobileapp",
        children: [
          {
            label: "セットアップ",
            path: "mobileapp/setup",
            href: "/viewer/mobileapp/setup",
            children: [],
          },
        ],
      },
      {
        label: "server",
        path: "server",
        href: "/viewer/server",
        children: [],
      },
    ]);
  });
});

function createIndexableDocument(
  overrides: Pick<IndexableDocument, "relativePath" | "viewerPath" | "title">,
): IndexableDocument {
  return {
    ...overrides,
    updatedAt: new Date("2026-05-16T00:00:00.000Z"),
    excerpt: "",
    headings: [],
    bodyText: "",
  };
}
