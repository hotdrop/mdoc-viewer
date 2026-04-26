import fs from "node:fs/promises";
import type { Stats } from "node:fs";
import path from "node:path";
import type {
  DocumentContent,
  IndexableDocument,
  RecentDocument,
} from "@/types/document";
import {
  normalizeDocPath,
  resolveLocalFullPath,
  stripLeadingSlash,
  type NormalizedDocPath,
} from "../path";
import type { DocumentRepository } from "./documentRepository";
import { deriveTitleFromPath, parseMarkdown } from "./utils";

export class LocalFsRepository implements DocumentRepository {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  async getDocument(docPath: NormalizedDocPath): Promise<DocumentContent> {
    const fullPath = resolveLocalFullPath(this.root, docPath.relativePath);
    const source = await fs.readFile(fullPath, "utf8");
    const stat = await fs.stat(fullPath);
    const parsed = parseMarkdown(source);

    return {
      relativePath: docPath.relativePath,
      viewerPath: docPath.viewerPath,
      body: parsed.body,
      frontmatter: parsed.frontmatter,
      etag: String(Math.floor(stat.mtimeMs)),
      updatedAt: stat.mtime,
      lastModified: stat.mtime,
    };
  }

  async listRecentDocuments(limit: number): Promise<RecentDocument[]> {
    const nodes = await this.listAllNodes();
    const sorted = nodes
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)
      .slice(0, limit);

    const results: RecentDocument[] = [];
    for (const node of sorted) {
      const parsed = parseMarkdown(await fs.readFile(node.fullPath, "utf8"));
      results.push({
        relativePath: node.relativePath,
        viewerPath: this.toViewerPath(node.relativePath),
        title: parsed.frontmatter.title ?? deriveTitleFromPath(node.relativePath),
        updatedAt: node.stat.mtime,
      });
    }
    return results;
  }

  async listIndexable(): Promise<IndexableDocument[]> {
    const nodes = await this.listAllNodes();
    const results: IndexableDocument[] = [];
    for (const node of nodes) {
      const source = await fs.readFile(node.fullPath, "utf8");
      const parsed = parseMarkdown(source);
      results.push({
        relativePath: node.relativePath,
        viewerPath: this.toViewerPath(node.relativePath),
        title: parsed.frontmatter.title ?? deriveTitleFromPath(node.relativePath),
        updatedAt: node.stat.mtime,
        excerpt: parsed.excerpt,
        headings: parsed.headings,
        bodyText: parsed.bodyText,
      });
    }
    return results;
  }

  private toViewerPath(relativePath: string): string {
    const docPath = normalizeDocPath(stripLeadingSlash(relativePath));
    return docPath.viewerPath;
  }

  private async listAllNodes(): Promise<
    Array<{ relativePath: string; fullPath: string; stat: Stats }>
  > {
    const accumulator: Array<{
      relativePath: string;
      fullPath: string;
      stat: Stats;
    }> = [];
    await this.walkDirectory(".", accumulator);
    return accumulator;
  }

  private async walkDirectory(
    relativeDir: string,
    accumulator: Array<{
      relativePath: string;
      fullPath: string;
      stat: Stats;
    }>,
  ): Promise<void> {
    const directoryPath = resolveLocalFullPath(this.root, relativeDir);
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const entryRelativePath =
        relativeDir === "."
          ? entry.name
          : `${relativeDir}/${entry.name}`;
      if (entry.isDirectory()) {
        await this.walkDirectory(entryRelativePath, accumulator);
      } else if (entry.isFile() && entry.name.endsWith(".txt")) {
        const fullPath = resolveLocalFullPath(this.root, entryRelativePath);
        const stat = await fs.stat(fullPath);
        accumulator.push({
          relativePath: entryRelativePath.replace(/\\/g, "/"),
          fullPath,
          stat,
        });
      }
    }
  }
}
