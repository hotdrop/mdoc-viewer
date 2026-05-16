import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth";
import { getChatAnswer } from "@/lib/chat/service";
import { logAccess } from "@/lib/logger";
import { applyCommonSecurityHeaders } from "@/server/headers/common";
import type { ChatRequest } from "@/types/chat";

export async function POST(request: NextRequest) {
  const { config, user } = await requireAuthenticatedContext(request);
  const responseHeaders = new Headers();
  responseHeaders.set("cache-control", "no-store");
  applyCommonSecurityHeaders(responseHeaders);

  try {
    const payload = (await request.json()) as Partial<ChatRequest>;
    const message = typeof payload.message === "string" ? payload.message.trim() : "";

    if (!message) {
      logAccess({
        user,
        path: request.nextUrl.pathname,
        status: 400,
        mode: config.runMode,
        route: "/api/chat",
        reason: "empty_message",
      });
      return NextResponse.json(
        { message: "質問本文を入力してください。" },
        { status: 400, headers: responseHeaders },
      );
    }

    const chatResponse = await getChatAnswer({ message });

    logAccess({
      user,
      path: request.nextUrl.pathname,
      status: 200,
      mode: config.runMode,
      route: "/api/chat",
    });

    return NextResponse.json(chatResponse, { headers: responseHeaders });
  } catch (error) {
    logAccess({
      user,
      path: request.nextUrl.pathname,
      status: 500,
      mode: config.runMode,
      route: "/api/chat",
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { message: "回答を取得できませんでした。" },
      { status: 500, headers: responseHeaders },
    );
  }
}
