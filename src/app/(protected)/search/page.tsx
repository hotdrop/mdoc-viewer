import { loadAppConfig } from "@/lib/config";
import { listIndexableDocuments } from "@/lib/documents/service";
import {
  SEARCH_METADATA_LIMIT,
  SEARCH_METADATA_SIZE_LIMIT,
} from "@/lib/constants";
import {
  serializeIndexableDocuments,
  type SearchPagePayload,
  type SearchMode,
} from "@/types/search";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const payload = await buildSearchPayload(searchParams.q ?? "");
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">ドキュメント検索</h1>
        <p className="text-sm text-slate-400">
          タイトル、見出し、本文の抜粋から検索します。
        </p>
      </header>
      <SearchClient payload={payload} />
    </main>
  );
}

async function buildSearchPayload(initialQuery: string): Promise<SearchPagePayload> {
  const config = loadAppConfig();
  const documents = await listIndexableDocuments(config);
  const serialized = serializeIndexableDocuments(documents);
  const payloadSize = Buffer.byteLength(JSON.stringify(serialized), "utf8");

  const mode: SearchMode =
    serialized.length > SEARCH_METADATA_LIMIT ||
    payloadSize > SEARCH_METADATA_SIZE_LIMIT
      ? "server"
      : "client";

  return {
    mode,
    documents: mode === "client" ? serialized : [],
    initialQuery,
  };
}
