import matter from "gray-matter";
import type { DocumentFrontmatter, SearchHeading } from "@/types/document";

export type ParsedMarkdown = {
  body: string;
  frontmatter: DocumentFrontmatter;
  excerpt: string;
  headings: SearchHeading[];
  bodyText: string;
};

export function parseMarkdown(source: string): ParsedMarkdown {
  const { content, data } = matter(source);
  const frontmatter = filterFrontmatter(data as Record<string, unknown>);
  const bodyText = buildSearchBodyText(content);
  return {
    body: content,
    frontmatter,
    excerpt: buildExcerpt(bodyText),
    headings: extractHeadings(content),
    bodyText,
  };
}

export function deriveTitleFromPath(relativePath: string): string {
  const segments = relativePath.replace(/\.txt$/i, "").split("/");
  const last = segments[segments.length - 1] ?? "";
  return last.replace(/[-_]/g, " ") || "Untitled";
}

function filterFrontmatter(data: Record<string, unknown>): DocumentFrontmatter {
  const result: DocumentFrontmatter = {};
  if (typeof data.title === "string") {
    result.title = data.title;
  }
  if (typeof data.description === "string") {
    result.description = data.description;
  }
  if (Array.isArray(data.tags)) {
    result.tags = (data.tags as unknown[])
      .filter((tag): tag is string => typeof tag === "string");
  }
  return result;
}

function buildExcerpt(text: string): string {
  const excerpt = text.trim();
  return excerpt.slice(0, 240);
}

export function buildSearchBodyText(content: string): string {
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, " ");
  const withoutInlineCode = withoutCodeBlocks.replace(/`([^`]*)`/g, "$1");
  const withoutHtml = withoutInlineCode.replace(/<[^>]+>/g, " ");
  const withoutImages = withoutHtml.replace(/!\[[^\]]*]\([^)]*\)/g, " ");
  const linksAsText = withoutImages.replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
  const withoutHeadingMarks = linksAsText.replace(/^#{1,6}\s+/gm, "");
  const withoutBlockMarks = withoutHeadingMarks
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "");
  const withoutTableMarks = withoutBlockMarks.replace(/[|]/g, " ");
  const withoutMarkdownMarks = withoutTableMarks.replace(/[*_~#\\[\](){}]/g, " ");
  return normalizeSearchText(withoutMarkdownMarks);
}

function extractHeadings(content: string): SearchHeading[] {
  const headings: SearchHeading[] = [];
  const usedIds = new Map<string, number>();
  for (const line of content.split(/\r?\n/)) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (match) {
      const depth = match[1]!.length;
      const title = normalizeSearchText(stripMarkdownInline(match[2]!.trim()));
      if (!title) {
        continue;
      }
      const id = buildUniqueHeadingId(title, usedIds);
      if (depth < 2 || depth > 3) {
        continue;
      }
      headings.push({
        title,
        id,
      });
    }
  }
  return headings.slice(0, 20);
}

function stripMarkdownInline(value: string): string {
  return value
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~#\\]/g, "");
}

function buildUniqueHeadingId(title: string, usedIds: Map<string, number>): string {
  const base = slugHeading(title);
  const usedCount = usedIds.get(base) ?? 0;
  usedIds.set(base, usedCount + 1);
  return usedCount === 0 ? base : `${base}-${usedCount}`;
}

export function slugHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\0-\x1f!-/:-@[-^`{-~]/g, "")
    .replace(/ /g, "-");
}

function normalizeSearchText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
