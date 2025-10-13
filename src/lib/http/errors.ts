import { NextResponse } from "next/server";

export function throwHttpError(status: number, message: string): never {
  const response = new NextResponse(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
  throw response;
}
