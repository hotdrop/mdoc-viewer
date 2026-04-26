"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_components/AuthProvider";
import {
  createSearchIndex,
  mapFuseResults,
} from "@/lib/search/searchDocuments";
import type {
  SearchMatchedField,
  SearchPagePayload,
  SearchResultItem,
} from "@/types/search";
import { formatDateTime } from "@/lib/datetime/format";

type SearchClientProps = {
  payload: SearchPagePayload;
};

export default function SearchClient({ payload }: SearchClientProps) {
  const auth = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(payload.initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mode = payload.mode;

  const searchIndex = useMemo(() => {
    if (mode !== "client") return null;
    return createSearchIndex(payload.documents);
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
      if (!searchIndex) {
        setResults([]);
        return;
      }
      setResults(mapFuseResults(searchIndex.search(query).slice(0, 20)));
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
          const data = (await response.json()) as { results: SearchResultItem[] };
          setResults(data.results);
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
  }, [auth.bearerToken, mode, query, searchIndex]);

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
        <span className="shrink-0 text-xs text-slate-500">
          {mode === "client" ? "高速検索" : "大規模検索"}
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
              href={result.targetHref}
              className="block space-y-2 text-slate-100 hover:text-cyan-300"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">{result.title}</h2>
                <span className="w-fit rounded border border-cyan-900/50 px-2 py-1 text-xs text-cyan-200">
                  {formatMatchedField(result.matchedField)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                最終更新: {formatDateTime(new Date(result.updatedAt))}
              </p>
              <p className="text-sm leading-6 text-slate-300">{result.snippet}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatMatchedField(field: SearchMatchedField): string {
  if (field === "title") return "タイトル一致";
  if (field === "heading") return "見出し一致";
  if (field === "body") return "本文一致";
  return "抜粋一致";
}
