import matter from "gray-matter";
import type { DocumentFrontmatter } from "@/types/document";

export type ParsedMarkdown = {
  body: string;
  frontmatter: DocumentFrontmatter;
  excerpt: string;
  headings: string[];
};

export function parseMarkdown(source: string): ParsedMarkdown {
  const { content, data } = matter(source);
  const frontmatter = filterFrontmatter(data as Record<string, unknown>);
  return {
    body: content,
    frontmatter,
    excerpt: buildExcerpt(content),
    headings: extractHeadings(content),
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

function buildExcerpt(content: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const excerpt = lines.slice(0, 4).join(" ");
  return excerpt.slice(0, 240);
}

function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (match) {
      headings.push(match[2]!.trim());
    }
  }
  return headings.slice(0, 20);
}
