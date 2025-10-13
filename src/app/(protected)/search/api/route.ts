import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { requireAuthenticatedContext } from "@/lib/auth";
import { listIndexableDocuments } from "@/lib/documents/service";
import { serializeIndexableDocuments, type SearchDocument } from "@/types/search";
import { SEARCH_SERVER_TTL_SECONDS } from "@/lib/constants";
import { logAccess } from "@/lib/logger";

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

type RouteParams = {
  params: Record<string, never>;
};

export async function GET(request: NextRequest, _params: RouteParams) {
  const { config, user } = await requireAuthenticatedContext(request);
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const responseHeaders = new Headers();
  responseHeaders.set(
    "cache-control",
    `private, max-age=0, stale-while-revalidate=${SEARCH_SERVER_TTL_SECONDS}`,
  );

  if (!query) {
    logAccess({
      user,
      path: request.nextUrl.pathname,
      status: 200,
      mode: config.runMode,
      route: "/search/api",
    });
    return NextResponse.json({ results: [] }, { headers: responseHeaders });
  }

  try {
    const documents = await listIndexableDocuments(config);
    const serialized = serializeIndexableDocuments(documents);
    const fuse = new Fuse(serialized, fuseOptions);
    const hits = fuse.search(query).slice(0, 30);
    const results = hits.map((hit) => hit.item);

    logAccess({
      user,
      path: request.nextUrl.pathname,
      status: 200,
      mode: config.runMode,
      route: "/search/api",
    });

    return NextResponse.json({ results }, { headers: responseHeaders });
  } catch (error) {
    logAccess({
      user,
      path: request.nextUrl.pathname,
      status: 500,
      mode: config.runMode,
      route: "/search/api",
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { message: "検索処理でエラーが発生しました。" },
      { status: 500, headers: responseHeaders },
    );
  }
}
