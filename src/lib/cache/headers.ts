export const CACHE_CONTROL_HEADER =
  "private, max-age=60, stale-while-revalidate=120";

export type CacheMetadata = {
  etag: string;
  lastModified: Date;
};

export function formatEtag(etag: string | number): string {
  const raw = typeof etag === "number" ? String(etag) : etag;
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("ETag が空です。");
  }
  return trimmed.startsWith('"') && trimmed.endsWith('"')
    ? trimmed
    : `"${trimmed}"`;
}

export function formatLastModified(date: Date): string {
  return date.toUTCString();
}

export function shouldReturnNotModified(
  requestHeaders: Headers,
  { etag }: CacheMetadata,
): boolean {
  const normalizedEtag = formatEtag(etag);
  const ifNoneMatch = requestHeaders.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch.split(/\s*,\s*/).includes(normalizedEtag)) {
    return true;
  }
  return false;
}

export function applyCacheHeaders(
  responseHeaders: Headers,
  { etag, lastModified }: CacheMetadata,
): void {
  responseHeaders.set("etag", formatEtag(etag));
  responseHeaders.set("last-modified", formatLastModified(lastModified));
  responseHeaders.set("cache-control", CACHE_CONTROL_HEADER);
}
