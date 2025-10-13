import { cache } from "react";
import type { AppConfig } from "@/lib/config";
import { renderMarkdown } from "@/lib/md/renderer";
import { createDocumentRepository } from "@/lib/repo";
import { normalizeDocPath, resolveRelativeDocPath } from "@/lib/path";
import type { DocumentContent, IndexableDocument, RecentDocument } from "@/types/document";

export const getDocumentRepositoryCached = cache((config: AppConfig) =>
  createDocumentRepository(config),
);

export async function fetchDocumentContent(
  config: AppConfig,
  pathSegments: string[] | string,
) {
  const repository = getDocumentRepositoryCached(config);
  const docPath = normalizeDocPath(pathSegments);
  const document = await repository.getDocument(docPath);
  const rendered = await renderMarkdown(document.body, {
    currentRelativePath: document.relativePath,
  });
  return {
    document,
    rendered,
  };
}

export async function fetchDocumentByRelativePath(
  config: AppConfig,
  relativePath: string,
) {
  const repository = getDocumentRepositoryCached(config);
  const docPath = normalizeDocPath(relativePath);
  const document = await repository.getDocument(docPath);
  const rendered = await renderMarkdown(document.body, {
    currentRelativePath: document.relativePath,
  });
  return {
    document,
    rendered,
  };
}

export async function listRecentDocuments(
  config: AppConfig,
  limit: number,
): Promise<RecentDocument[]> {
  const repository = getDocumentRepositoryCached(config);
  return repository.listRecentDocuments(limit);
}

export async function listIndexableDocuments(
  config: AppConfig,
): Promise<IndexableDocument[]> {
  const repository = getDocumentRepositoryCached(config);
  return repository.listIndexable();
}

export function resolveRelativeDocumentPath(
  currentRelativePath: string,
  target: string,
) {
  return resolveRelativeDocPath(currentRelativePath, target);
}
