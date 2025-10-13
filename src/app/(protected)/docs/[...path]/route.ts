import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth";
import { normalizeDocPath } from "@/lib/path";
import { createDocumentRepository } from "@/lib/repo";
import { applyCacheHeaders, shouldReturnNotModified } from "@/lib/cache/headers";
import { logAccess } from "@/lib/logger";

type RouteParams = {
  params: {
    path?: string[];
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { config, user } = await requireAuthenticatedContext(request);
  const docPath = normalizeDocPath(params.path ?? []);
  const repository = createDocumentRepository(config);

  const responseHeaders = new Headers();
  let status = 200;

  try {
    const document = await repository.getDocument(docPath);
    const cacheMetadata = {
      etag: document.etag,
      lastModified: document.lastModified,
    };

    if (shouldReturnNotModified(request.headers, cacheMetadata)) {
      applyCacheHeaders(responseHeaders, cacheMetadata);
      status = 304;
      logAccess({
        user,
        path: request.nextUrl.pathname,
        status,
        mode: config.runMode,
        route: "/docs/[...path]",
      });
      return new NextResponse(null, {
        status,
        headers: responseHeaders,
      });
    }

    applyCacheHeaders(responseHeaders, cacheMetadata);
    responseHeaders.set("content-type", "application/json; charset=utf-8");

    const payload = {
      relativePath: document.relativePath,
      viewerPath: document.viewerPath,
      frontmatter: document.frontmatter,
      body: document.body,
      updatedAt: document.updatedAt.toISOString(),
      etag: document.etag,
    };

    logAccess({
      user,
      path: request.nextUrl.pathname,
      status,
      mode: config.runMode,
      route: "/docs/[...path]",
    });

    return NextResponse.json(payload, {
      status,
      headers: responseHeaders,
    });
  } catch (error) {
    status = mapErrorToStatus(error);
    logAccess({
      user,
      path: request.nextUrl.pathname,
      status,
      mode: config.runMode,
      route: "/docs/[...path]",
      reason: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(
      { message: "ドキュメントを取得できませんでした。" },
      {
        status,
      },
    );
  }
}

function mapErrorToStatus(error: unknown): number {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (code === "ENOENT" || code === "404") {
      return 404;
    }
  }
  return 500;
}
