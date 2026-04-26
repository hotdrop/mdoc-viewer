import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth";
import { listIndexableDocuments } from "@/lib/documents/service";
import { searchDocuments } from "@/lib/search/searchDocuments";
import { serializeIndexableDocuments } from "@/types/search";
import { SEARCH_SERVER_TTL_SECONDS } from "@/lib/constants";
import { logAccess } from "@/lib/logger";
import { applyCommonSecurityHeaders } from "@/server/headers/common";

export async function GET(request: NextRequest) {
  const { config, user } = await requireAuthenticatedContext(request);
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const responseHeaders = new Headers();
  responseHeaders.set(
    "cache-control",
    `private, max-age=0, stale-while-revalidate=${SEARCH_SERVER_TTL_SECONDS}`,
  );
  applyCommonSecurityHeaders(responseHeaders);

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
    const results = searchDocuments(serialized, query, 30);

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
