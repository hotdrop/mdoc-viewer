import type { ReactNode } from "react";
import Link from "next/link";
import type { DocumentTreeNode } from "@/types/document";

type DocumentNavigationProps = {
  tree: DocumentTreeNode[];
  currentPath: string;
  title?: string;
  className?: string;
  showSearchLink?: boolean;
  searchHref?: string;
};

export function DocumentNavigation({
  tree,
  currentPath,
  title = "ドキュメント",
  className = "",
  showSearchLink = true,
  searchHref = "/search",
}: DocumentNavigationProps) {
  const containerClass = [
    "rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <nav className={containerClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h2>
        {showSearchLink ? (
          <Link
            href={searchHref}
            className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
          >
            検索
          </Link>
        ) : null}
      </div>
      <div className="space-y-2">
        {tree.length > 0 ? (
          renderTree(tree, currentPath, 0)
        ) : (
          <p className="text-xs text-slate-500">ドキュメントが見つかりません。</p>
        )}
      </div>
    </nav>
  );
}

function renderTree(
  nodes: DocumentTreeNode[],
  currentPath: string,
  depth: number,
): ReactNode {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const key = node.href ?? `dir:${node.path || node.label}`;
        const isActive = node.href
          ? normalizePath(node.href) === normalizePath(currentPath)
          : false;
        const hasChildren = node.children.length > 0;
        const indentStyle =
          depth > 0
            ? {
                paddingLeft: depth * 12,
              }
            : undefined;

        return (
          <li key={key} className="space-y-1">
            <div
              className={`flex items-start gap-2 ${depth > 0 ? "border-l border-slate-800" : ""}`}
              style={indentStyle}
            >
              <span
                className={
                  hasChildren
                    ? "mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-slate-600"
                    : "mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-slate-700"
                }
              />
              {node.href ? (
                <Link
                  href={node.href}
                  className={`block flex-1 truncate rounded px-1 py-1 transition ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-300 hover:text-cyan-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {node.label}
                </Link>
              ) : (
                <span className="block flex-1 truncate px-1 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {node.label || "未分類"}
                </span>
              )}
            </div>
            {hasChildren && (
              <div className="pl-4">
                {renderTree(node.children, currentPath, depth + 1)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function normalizePath(path: string): string {
  return path.replace(/\/+$/, "");
}
