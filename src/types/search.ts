import type { IndexableDocument } from "./document";

export type SearchDocument = Omit<IndexableDocument, "updatedAt"> & {
  updatedAt: string;
};

export type SearchMode = "client" | "server";

export type SearchPagePayload = {
  mode: SearchMode;
  documents: SearchDocument[];
  initialQuery: string;
};

export function serializeIndexableDocuments(
  docs: IndexableDocument[],
): SearchDocument[] {
  return docs.map((doc) => ({
    ...doc,
    updatedAt: doc.updatedAt.toISOString(),
  }));
}
