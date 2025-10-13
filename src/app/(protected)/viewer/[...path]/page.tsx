import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAppConfig } from "@/lib/config";
import { fetchDocumentContent } from "@/lib/documents/service";
import { formatDateTime } from "@/lib/datetime/format";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { TableOfContents } from "@/components/TableOfContents";

export const dynamic = "force-dynamic";

type ViewerPageProps = {
  params: {
    path?: string[];
  };
};

export default async function ViewerPage({ params }: ViewerPageProps) {
  const config = loadAppConfig();
  const pathSegments = params.path ?? [];

  try {
    const { document, rendered } = await fetchDocumentContent(
      config,
      pathSegments,
    );

    const title = document.frontmatter.title ?? buildTitle(pathSegments);
    const breadcrumbs = buildBreadcrumbs(document.relativePath);

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <MarkdownArticle
            className="markdown-body"
            html={rendered.html}
          />
          <TableOfContents toc={rendered.toc} />
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

function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    return code === "ENOENT" || code === "404";
  }
  return false;
}
