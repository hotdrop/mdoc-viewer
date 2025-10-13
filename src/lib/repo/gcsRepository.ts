import { Storage } from "@google-cloud/storage";
import type {
  DocumentContent,
  IndexableDocument,
  RecentDocument,
} from "@/types/document";
import {
  normalizeDocPath,
  stripLeadingSlash,
  type NormalizedDocPath,
} from "../path";
import type { DocumentRepository } from "./documentRepository";
import { deriveTitleFromPath, parseMarkdown } from "./utils";

export class GcsRepository implements DocumentRepository {
  private readonly storage = new Storage();
  private readonly bucket;

  constructor(bucketName: string) {
    this.bucket = this.storage.bucket(bucketName);
  }

  async getDocument(docPath: NormalizedDocPath): Promise<DocumentContent> {
    const file = this.bucket.file(docPath.relativePath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error("ドキュメントが存在しません。");
    }

    const [[content], metadata] = await Promise.all([
      file.download(),
      file.getMetadata(),
    ]);
    const parsed = parseMarkdown(content.toString("utf8"));
    const etag = metadata.etag ?? metadata.generation ?? "";
    const updatedAt = metadata.updated
      ? new Date(metadata.updated)
      : new Date();

    return {
      relativePath: docPath.relativePath,
      viewerPath: docPath.viewerPath,
      body: parsed.body,
      frontmatter: parsed.frontmatter,
      etag: etag || String(updatedAt.getTime()),
      updatedAt,
      lastModified: updatedAt,
    };
  }

  async listRecentDocuments(limit: number): Promise<RecentDocument[]> {
    const [files] = await this.bucket.getFiles();
    const enriched = await Promise.all(
      files
        .filter((file) => file.name.endsWith(".txt"))
        .map(async (file) => {
          const [metadata] = await file.getMetadata();
          const updatedAt = metadata.updated
            ? new Date(metadata.updated)
            : new Date();
          const [content] = await file.download();
          const parsed = parseMarkdown(content.toString("utf8"));
          return {
            relativePath: file.name,
            viewerPath: this.toViewerPath(file.name),
            title:
              parsed.frontmatter.title ??
              deriveTitleFromPath(file.name),
            updatedAt,
          };
        }),
    );

    return enriched
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  async listIndexable(): Promise<IndexableDocument[]> {
    const [files] = await this.bucket.getFiles();
    const results: IndexableDocument[] = [];
    for (const file of files) {
      if (!file.name.endsWith(".txt")) continue;
      const [[content], [metadata]] = await Promise.all([
        file.download(),
        file.getMetadata(),
      ]);
      const parsed = parseMarkdown(content.toString("utf8"));
      const updatedAt = metadata.updated
        ? new Date(metadata.updated)
        : new Date();
      results.push({
        relativePath: file.name,
        viewerPath: this.toViewerPath(file.name),
        title: parsed.frontmatter.title ?? deriveTitleFromPath(file.name),
        updatedAt,
        excerpt: parsed.excerpt,
        headings: parsed.headings,
      });
    }
    return results;
  }

  private toViewerPath(relativePath: string): string {
    const docPath = normalizeDocPath(stripLeadingSlash(relativePath));
    return docPath.viewerPath;
  }
}
