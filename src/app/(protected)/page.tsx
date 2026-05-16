import Link from "next/link";
import { loadAppConfig, type AppConfig } from "@/lib/config";
import {
  fetchDocumentByRelativePath,
  listDocumentTree,
  listRecentDocuments,
} from "@/lib/documents/service";
import { RECENT_DOCUMENT_LIMIT, TOP_DOCUMENT_PATH } from "@/lib/constants";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { formatDateTime } from "@/lib/datetime/format";
import { RecentlyViewedDocuments } from "./_components/RecentlyViewedDocuments";
import { DocumentNavigation } from "./viewer/_components/DocumentNavigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const config = loadAppConfig();
  const [topDocument, recentDocuments, documentTree] = await Promise.all([
    loadTopDocument(config),
    listRecentDocuments(config, RECENT_DOCUMENT_LIMIT),
    listDocumentTree(config),
  ]);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden lg:block lg:self-start">
          <DocumentNavigation
            tree={documentTree}
            currentPath=""
            className="lg:sticky lg:top-8"
          />
        </aside>

        <div className="min-w-0 space-y-8">
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <header className="mb-6">
              <h1 className="text-2xl font-semibold">
                {topDocument?.document.frontmatter.title ?? "トップドキュメント"}
              </h1>
              <p className="text-sm text-slate-400">
                ドキュメントルートの index.txt を表示します。
              </p>
            </header>
            {topDocument ? (
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-5">
                <MarkdownArticle
                  className="markdown-body max-w-none"
                  html={topDocument.rendered.html}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                トップドキュメントはまだ登録されていません。
              </p>
            )}
          </section>

          <details className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-slate-100">
              ドキュメントツリー
            </summary>
            <DocumentNavigation
              tree={documentTree}
              currentPath=""
              className="mt-4 border-0 bg-transparent p-0"
            />
          </details>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <header className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">最近更新されたドキュメント</h2>
                <p className="text-sm text-slate-400">
                  更新日時の新しい順で{RECENT_DOCUMENT_LIMIT}件まで表示します。
                </p>
              </div>
            </header>
            <ul className="space-y-4">
              {recentDocuments.map((doc) => (
                <li
                  key={doc.relativePath}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-600"
                >
                  <Link
                    href={doc.viewerPath}
                    className="flex flex-col gap-2 text-slate-100 hover:text-cyan-300"
                  >
                    <span className="text-lg font-medium">
                      {doc.title || doc.viewerPath}
                    </span>
                    <span className="text-xs text-slate-400">
                      更新日時: {formatDateTime(doc.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
              {recentDocuments.length === 0 && (
                <li className="text-sm text-slate-400">
                  更新履歴がまだありません。
                </li>
              )}
            </ul>
          </section>

          <RecentlyViewedDocuments />
        </div>
      </div>
    </main>
  );
}

async function loadTopDocument(config: AppConfig) {
  try {
    return await fetchDocumentByRelativePath(config, TOP_DOCUMENT_PATH);
  } catch {
    return null;
  }
}
