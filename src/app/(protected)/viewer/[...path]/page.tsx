import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAppConfig } from "@/lib/config";
import {
  fetchDocumentContent,
  listDocumentTree,
} from "@/lib/documents/service";
import { formatDateTime } from "@/lib/datetime/format";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { TableOfContents } from "@/components/TableOfContents";
import { getAdjacentDocuments } from "@/lib/viewer/navigation";
import { DocumentNavigation } from "../_components/DocumentNavigation";
import { MobileTableOfContents } from "../_components/MobileTableOfContents";
import { ViewerDocumentActions } from "../_components/ViewerDocumentActions";

export const dynamic = "force-dynamic";

type ViewerPageParams = {
  path?: string[];
};

type ViewerPageProps = {
  params: Promise<ViewerPageParams>;
  searchParams: Promise<{
    searchQuery?: string;
  }>;
};

export default async function ViewerPage({ params, searchParams }: ViewerPageProps) {
  const config = loadAppConfig();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const pathSegments = resolvedParams?.path ?? [];

  try {
    const [content, documentTree] = await Promise.all([
      fetchDocumentContent(config, pathSegments),
      listDocumentTree(config),
    ]);
    const { document, rendered } = content;

    const title = document.frontmatter.title ?? buildTitle(pathSegments);
    const breadcrumbs = buildBreadcrumbs(document.relativePath);
    const adjacentDocuments = getAdjacentDocuments(documentTree, document.viewerPath);
    const searchHref = buildSearchHref(resolvedSearchParams?.searchQuery);

    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-400">
          <Link href="/" className="hover:text-cyan-300">
            ホーム
          </Link>
          {breadcrumbs.map((item) => (
            <span key={item.href} className="mx-1 text-slate-600">
              /
              <Link
                href={item.href}
                className="ml-1 hover:text-cyan-300"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-100">{title}</h1>
          <p className="text-sm text-slate-400">
            最終更新: {formatDateTime(document.updatedAt)}
          </p>
        </header>

        <ViewerDocumentActions
          previous={adjacentDocuments.previous}
          next={adjacentDocuments.next}
          searchHref={searchHref}
        />

        <MobileTableOfContents toc={rendered.toc} />

        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_17rem]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <DocumentNavigation
              tree={documentTree}
              currentPath={document.viewerPath}
            />
          </aside>
          <section className="min-w-0">
            <MarkdownArticle
              className="markdown-body"
              html={rendered.html}
            />
          </section>
          <aside className="hidden xl:block xl:sticky xl:top-6 xl:self-start">
            <TableOfContents toc={rendered.toc} />
          </aside>
        </div>
      </main>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

function buildTitle(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return "ドキュメント";
  }
  return pathSegments[pathSegments.length - 1]!
    .replace(/\.txt$/i, "")
    .replace(/[-_]/g, " ");
}

function buildBreadcrumbs(relativePath: string) {
  const withoutExtension = relativePath.replace(/\.txt$/i, "");
  const segments = withoutExtension.split("/").filter(Boolean);
  const breadcrumbs = [] as Array<{ href: string; label: string }>;
  const stack: string[] = [];
  for (const segment of segments) {
    stack.push(segment);
    breadcrumbs.push({
      href: `/viewer/${stack.join("/")}`,
      label: segment.replace(/[-_]/g, " "),
    });
  }
  return breadcrumbs;
}

function buildSearchHref(searchQuery?: string): string {
  const query = searchQuery?.trim();
  return query ? `/search?q=${encodeURIComponent(query)}` : "/search";
}

function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    return code === "ENOENT" || code === "404";
  }
  return false;
}
