import type {
  DocumentContent,
  IndexableDocument,
  RecentDocument,
} from "@/types/document";
import type { AppConfig } from "../config";
import type { NormalizedDocPath } from "../path";
import { GcsRepository } from "./gcsRepository";
import { LocalFsRepository } from "./localFsRepository";

export interface DocumentRepository {
  getDocument(path: NormalizedDocPath): Promise<DocumentContent>;
  listRecentDocuments(limit: number): Promise<RecentDocument[]>;
  listIndexable(): Promise<IndexableDocument[]>;
}

export interface RepositoryFactoryContext {
  config: AppConfig;
}

export function createDocumentRepository(
  config: AppConfig,
): DocumentRepository {
  if (config.runMode === "local") {
    return new LocalFsRepository(config.localDocsRoot!);
  }
  return new GcsRepository(config.gcsBucket!);
}
