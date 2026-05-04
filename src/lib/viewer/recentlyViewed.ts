export type RecentlyViewedDocument = {
  viewerPath: string;
  title: string;
  viewedAt: string;
};

export const RECENTLY_VIEWED_STORAGE_KEY = "md-doc-viewer:recently-viewed";
export const RECENTLY_VIEWED_MAX_ITEMS = 8;

type RecentlyViewedStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readRecentlyViewedDocuments(
  storage = getRecentlyViewedStorage(),
): RecentlyViewedDocument[] {
  if (!storage) return [];

  const raw = storage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      clearInvalidRecentlyViewedStorage(storage);
      return [];
    }

    const documents = parsed.filter(isRecentlyViewedDocument);
    if (documents.length !== parsed.length) {
      clearInvalidRecentlyViewedStorage(storage);
      return [];
    }

    return documents.slice(0, RECENTLY_VIEWED_MAX_ITEMS);
  } catch {
    clearInvalidRecentlyViewedStorage(storage);
    return [];
  }
}

export function saveRecentlyViewedDocument(
  entry: RecentlyViewedDocument,
  storage = getRecentlyViewedStorage(),
): RecentlyViewedDocument[] {
  if (!storage || !isRecentlyViewedDocument(entry)) {
    return readRecentlyViewedDocuments(storage);
  }

  const existing = readRecentlyViewedDocuments(storage);
  const next = [
    entry,
    ...existing.filter((document) => document.viewerPath !== entry.viewerPath),
  ].slice(0, RECENTLY_VIEWED_MAX_ITEMS);

  storage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearInvalidRecentlyViewedStorage(
  storage = getRecentlyViewedStorage(),
): void {
  storage?.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
}

function getRecentlyViewedStorage(): RecentlyViewedStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function isRecentlyViewedDocument(value: unknown): value is RecentlyViewedDocument {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<RecentlyViewedDocument>;
  return (
    typeof candidate.viewerPath === "string" &&
    candidate.viewerPath.startsWith("/viewer/") &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.viewedAt === "string" &&
    !Number.isNaN(Date.parse(candidate.viewedAt))
  );
}
