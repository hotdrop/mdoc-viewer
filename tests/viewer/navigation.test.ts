import { describe, expect, it } from "vitest";
import {
  flattenDocumentTree,
  getAdjacentDocuments,
} from "@/lib/viewer/navigation";
import type { DocumentTreeNode } from "@/types/document";

const tree: DocumentTreeNode[] = [
  {
    label: "ガイド",
    path: "guide",
    children: [
      {
        label: "はじめに",
        path: "guide/intro",
        href: "/viewer/guide/intro",
        children: [],
      },
      {
        label: "詳細",
        path: "guide/detail",
        href: "/viewer/guide/detail",
        children: [],
      },
    ],
  },
  {
    label: "リファレンス",
    path: "reference",
    href: "/viewer/reference",
    children: [],
  },
];

describe("flattenDocumentTree", () => {
  it("ディレクトリを除外して表示順の文書リンクだけを返す", () => {
    expect(flattenDocumentTree(tree)).toEqual([
      { href: "/viewer/guide/intro", label: "はじめに" },
      { href: "/viewer/guide/detail", label: "詳細" },
      { href: "/viewer/reference", label: "リファレンス" },
    ]);
  });
});

describe("getAdjacentDocuments", () => {
  it("現在文書の前後リンクを返す", () => {
    expect(getAdjacentDocuments(tree, "/viewer/guide/detail")).toEqual({
      previous: { href: "/viewer/guide/intro", label: "はじめに" },
      next: { href: "/viewer/reference", label: "リファレンス" },
    });
  });

  it("先頭文書では previous を返さない", () => {
    expect(getAdjacentDocuments(tree, "/viewer/guide/intro")).toEqual({
      previous: undefined,
      next: { href: "/viewer/guide/detail", label: "詳細" },
    });
  });

  it("末尾スラッシュの差分を吸収する", () => {
    expect(getAdjacentDocuments(tree, "/viewer/reference/")).toEqual({
      previous: { href: "/viewer/guide/detail", label: "詳細" },
      next: undefined,
    });
  });
});
