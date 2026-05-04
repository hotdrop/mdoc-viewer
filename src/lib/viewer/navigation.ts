import type { DocumentTreeNode } from "@/types/document";

export type ViewerAdjacentLink = {
  href: string;
  label: string;
};

export type ViewerAdjacentDocuments = {
  previous?: ViewerAdjacentLink;
  next?: ViewerAdjacentLink;
};

export function getAdjacentDocuments(
  tree: DocumentTreeNode[],
  currentPath: string,
): ViewerAdjacentDocuments {
  const documents = flattenDocumentTree(tree);
  const currentIndex = documents.findIndex(
    (document) => normalizePath(document.href) === normalizePath(currentPath),
  );

  if (currentIndex === -1) {
    return {};
  }

  return {
    previous: documents[currentIndex - 1],
    next: documents[currentIndex + 1],
  };
}

export function flattenDocumentTree(
  tree: DocumentTreeNode[],
): ViewerAdjacentLink[] {
  const documents: ViewerAdjacentLink[] = [];

  for (const node of tree) {
    if (node.href) {
      documents.push({
        href: node.href,
        label: node.label,
      });
    }
    documents.push(...flattenDocumentTree(node.children));
  }

  return documents;
}

function normalizePath(path: string): string {
  return path.replace(/\/+$/, "");
}
