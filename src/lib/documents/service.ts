import { cache } from "react";
import type { AppConfig } from "@/lib/config";
import { renderMarkdown } from "@/lib/md/renderer";
import { createDocumentRepository } from "@/lib/repo";
import { normalizeDocPath, resolveRelativeDocPath } from "@/lib/path";
import type {
  DocumentContent,
  DocumentTreeNode,
  IndexableDocument,
  RecentDocument,
} from "@/types/document";

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

export async function listDocumentTree(
  config: AppConfig,
): Promise<DocumentTreeNode[]> {
  const repository = getDocumentRepositoryCached(config);
  const documents = await repository.listIndexable();
  return buildDocumentTree(documents);
}

export function resolveRelativeDocumentPath(
  currentRelativePath: string,
  target: string,
) {
  return resolveRelativeDocPath(currentRelativePath, target);
}

type MutableDirectoryNode = {
  readonly type: "directory";
  readonly key: string;
  label: string;
  path: string;
  children: Map<string, MutableNode>;
};

type MutableDocumentNode = {
  readonly type: "document";
  readonly key: string;
  label: string;
  path: string;
  href: string;
};

type MutableNode = MutableDirectoryNode | MutableDocumentNode;

function buildDocumentTree(documents: IndexableDocument[]): DocumentTreeNode[] {
  const root: MutableDirectoryNode = {
    type: "directory",
    key: "",
    label: "",
    path: "",
    children: new Map(),
  };

  for (const doc of documents) {
    insertDocumentNode(root, doc);
  }

  return convertToTreeNodes(root.children);
}

function insertDocumentNode(
  root: MutableDirectoryNode,
  doc: IndexableDocument,
): void {
  const withoutExtension = doc.relativePath.replace(/\.txt$/i, "");
  const segments = withoutExtension.split("/").filter(Boolean);
  let parent = root;
  let currentPath = "";

  for (let i = 0; i < Math.max(0, segments.length - 1); i += 1) {
    const segment = segments[i]!;
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    const directoryKey = `dir:${currentPath}`;
    const existing = parent.children.get(directoryKey);
    if (existing && existing.type === "document") {
      continue;
    }
    if (!existing) {
      const directoryNode: MutableDirectoryNode = {
        type: "directory",
        key: directoryKey,
        label: formatSegmentLabel(segment),
        path: currentPath,
        children: new Map(),
      };
      parent.children.set(directoryKey, directoryNode);
      parent = directoryNode;
    } else {
      parent = existing as MutableDirectoryNode;
    }
  }

  const lastSegment = segments.at(-1) ?? "";
  const documentKey = `doc:${withoutExtension}`;
  parent.children.set(documentKey, {
    type: "document",
    key: documentKey,
    label: doc.title || formatSegmentLabel(lastSegment) || doc.viewerPath,
    path: withoutExtension,
    href: doc.viewerPath,
  });
}

function convertToTreeNodes(
  children: Map<string, MutableNode>,
): DocumentTreeNode[] {
  const nodes = Array.from(children.values());
  nodes.sort((a, b) => {
    if (a.type === b.type) {
      return a.label.localeCompare(b.label, "ja");
    }
    return a.type === "directory" ? -1 : 1;
  });

  return nodes.map((node) => {
    if (node.type === "document") {
      return {
        label: node.label,
        path: node.path,
        href: node.href,
        children: [],
      };
    }
    return {
      label: node.label,
      path: node.path,
      children: convertToTreeNodes(node.children),
    };
  });
}

function formatSegmentLabel(segment: string): string {
  return segment.replace(/[-_]/g, " ").trim();
}
