"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { useRouter } from "next/navigation";
import { useAuth } from "../_components/AuthProvider";
import type { SearchDocument, SearchPagePayload } from "@/types/search";
import { formatDateTime } from "@/lib/datetime/format";

const fuseOptions: IFuseOptions<SearchDocument> = {
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
  keys: [
    { name: "title", weight: 0.6 },
    { name: "headings", weight: 0.3 },
    { name: "excerpt", weight: 0.1 },
  ],
};

type SearchResult = SearchDocument & { score: number };

type SearchClientProps = {
  payload: SearchPagePayload;
};

export default function SearchClient({ payload }: SearchClientProps) {
  const auth = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(payload.initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mode = payload.mode;

  const fuse = useMemo(() => {
    if (mode !== "client") return null;
    return new Fuse(payload.documents, fuseOptions);
  }, [mode, payload.documents]);

  useEffect(() => {
    setQuery(payload.initialQuery);
  }, [payload.initialQuery]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    if (mode === "client") {
      if (!fuse) {
        setResults([]);
        return;
      }
      const hits = fuse.search(query).slice(0, 20);
      setResults(
        hits.map((hit) => ({
          ...hit.item,
          score: hit.score ?? 0,
        })),
      );
    } else {
      const controller = new AbortController();
      const doFetch = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/search/api?q=${encodeURIComponent(query)}`, {
            headers: auth.bearerToken ? { Authorization: auth.bearerToken } : undefined,
            cache: "no-store",
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error("検索API呼び出しに失敗しました。");
          }
          const data = (await response.json()) as { results: SearchDocument[] };
          setResults(data.results.map((doc) => ({ ...doc, score: 0 })));
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            console.error(error);
          }
        } finally {
          setIsLoading(false);
        }
      };
      void doFetch();
      return () => controller.abort();
    }
  }, [auth.bearerToken, fuse, mode, query]);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    const nextUrl = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    router.replace(nextUrl);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-base outline-none focus:border-cyan-400"
          placeholder="キーワードを入力"
          value={query}
          onChange={handleInput}
        />
        <span className="text-xs text-slate-500">
          モード: {mode === "client" ? "クライアント検索" : "サーバ検索"}
        </span>
      </div>

      {mode === "server" && isLoading && (
        <p className="text-sm text-slate-400">検索中です…</p>
      )}

      {(!query || results.length === 0) && !isLoading && (
        <p className="text-sm text-slate-400">
          {query ? "該当するドキュメントが見つかりませんでした。" : "検索キーワードを入力すると結果が表示されます。"}
        </p>
      )}

      <ul className="space-y-4">
        {results.map((result) => (
          <li
            key={result.relativePath}
            className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
          >
            <a
              href={result.viewerPath}
              className="space-y-2 text-slate-100 hover:text-cyan-300"
            >
              <h2 className="text-lg font-semibold">{result.title}</h2>
              <p className="text-sm text-slate-400">
                最終更新: {formatDateTime(new Date(result.updatedAt))}
              </p>
              <p className="text-sm text-slate-300">{result.excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
