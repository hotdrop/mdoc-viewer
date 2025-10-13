import Link from "next/link";
import { loadAppConfig, type AppConfig } from "@/lib/config";
import {
  fetchDocumentByRelativePath,
  listRecentDocuments,
} from "@/lib/documents/service";
import {
  RECENT_DOCUMENT_LIMIT,
  RELEASE_NOTES_PATH,
  SCHEDULE_ROADMAP_PATH,
} from "@/lib/constants";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { formatDateTime } from "@/lib/datetime/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const config = loadAppConfig();
  const [roadmap, releaseNotes, recentDocuments] = await Promise.all([
    loadScheduleRoadmap(config),
    loadReleaseNotes(config),
    listRecentDocuments(config, RECENT_DOCUMENT_LIMIT),
  ]);

  return (
    <main className="flex flex-col gap-12 px-8 py-10">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">ロードマップ</h1>
          <p className="text-sm text-slate-400">
            進行中および今後の取り組みを確認できます。
          </p>
        </header>
        {roadmap ? (
          <div className="relative overflow-hidden rounded-lg border border-cyan-900/30 bg-slate-950/40">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-cyan-500/30" aria-hidden />
            <div className="relative px-6 py-6 pl-12">
              <MarkdownArticle
                className="markdown-body max-w-none"
                html={roadmap.rendered.html}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            ロードマップドキュメントが見つかりませんでした。
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">リリースノート</h1>
          <p className="text-sm text-slate-400">
            最新のお知らせを確認してください。
          </p>
        </header>
        {releaseNotes ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-5">
            <MarkdownArticle
              className="markdown-body max-w-none"
              html={releaseNotes.rendered.html}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            リリースノートはまだ登録されていません。
          </p>
        )}
      </section>

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
    </main>
  );
}

async function loadReleaseNotes(config: AppConfig) {
  try {
    return await fetchDocumentByRelativePath(config, RELEASE_NOTES_PATH);
  } catch {
    return null;
  }
}

async function loadScheduleRoadmap(config: AppConfig) {
  try {
    return await fetchDocumentByRelativePath(config, SCHEDULE_ROADMAP_PATH);
  } catch {
    return null;
  }
}
