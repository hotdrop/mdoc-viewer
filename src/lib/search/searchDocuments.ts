import Fuse from "fuse.js";
import type { FuseResult, FuseResultMatch, IFuseOptions } from "fuse.js";
import type {
  SearchDocument,
  SearchMatchedField,
  SearchResultItem,
} from "@/types/search";

const SNIPPET_RADIUS = 56;

export const searchFuseOptions: IFuseOptions<SearchDocument> = {
  includeMatches: true,
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
  keys: [
    { name: "title", weight: 0.55 },
    { name: "headings.title", weight: 0.3 },
    { name: "bodyText", weight: 0.1 },
    { name: "excerpt", weight: 0.05 },
  ],
};

export function createSearchIndex(documents: SearchDocument[]) {
  return new Fuse(documents, searchFuseOptions);
}

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  limit: number,
): SearchResultItem[] {
  if (!query.trim()) {
    return [];
  }
  return mapFuseResults(createSearchIndex(documents).search(query).slice(0, limit));
}

export function mapFuseResults(
  hits: Array<FuseResult<SearchDocument>>,
): SearchResultItem[] {
  return hits.map((hit) => buildSearchResultItem(hit));
}

function buildSearchResultItem(hit: FuseResult<SearchDocument>): SearchResultItem {
  const match = selectBestMatch(hit.matches ?? []);
  const matchedField = getMatchedField(match);
  const heading = matchedField === "heading"
    ? hit.item.headings[match?.refIndex ?? -1]
    : undefined;
  const sourceText = getMatchSourceText(hit.item, matchedField, match?.refIndex);

  return {
    relativePath: hit.item.relativePath,
    viewerPath: hit.item.viewerPath,
    title: hit.item.title,
    updatedAt: hit.item.updatedAt,
    snippet: buildSnippet(sourceText || hit.item.excerpt || hit.item.title, match),
    matchedField,
    targetHref: heading ? `${hit.item.viewerPath}#${heading.id}` : hit.item.viewerPath,
  };
}

function selectBestMatch(
  matches: readonly FuseResultMatch[],
): FuseResultMatch | undefined {
  return [...matches].sort((a, b) => getFieldPriority(a) - getFieldPriority(b))[0];
}

function getFieldPriority(match: FuseResultMatch): number {
  const field = getMatchedField(match);
  if (field === "title") return 0;
  if (field === "heading") return 1;
  if (field === "body") return 2;
  return 3;
}

function getMatchedField(match: FuseResultMatch | undefined): SearchMatchedField {
  const key = match?.key;
  if (key === "title") return "title";
  if (key === "headings.title") return "heading";
  if (key === "bodyText") return "body";
  return "excerpt";
}

function getMatchSourceText(
  document: SearchDocument,
  field: SearchMatchedField,
  refIndex: number | undefined,
): string {
  if (field === "title") return document.title;
  if (field === "heading") return document.headings[refIndex ?? -1]?.title ?? document.title;
  if (field === "body") return document.bodyText;
  return document.excerpt;
}

export function buildSnippet(
  sourceText: string,
  match?: Pick<FuseResultMatch, "indices">,
): string {
  const normalized = sourceText.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  const firstRange = match?.indices?.[0];
  if (!firstRange) {
    return truncateSnippet(normalized);
  }

  const [matchStart, matchEnd] = firstRange;
  const start = Math.max(0, matchStart - SNIPPET_RADIUS);
  const end = Math.min(normalized.length, matchEnd + SNIPPET_RADIUS + 1);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalized.length ? "..." : "";
  return `${prefix}${normalized.slice(start, end)}${suffix}`;
}

function truncateSnippet(value: string): string {
  if (value.length <= 160) {
    return value;
  }
  return `${value.slice(0, 160)}...`;
}
