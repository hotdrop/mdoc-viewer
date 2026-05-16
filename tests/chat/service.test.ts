import { describe, expect, it } from "vitest";
import { getChatAnswer } from "@/lib/chat/service";

describe("getChatAnswer", () => {
  it("ダミー回答と参照元を返す", async () => {
    const response = await getChatAnswer({ message: "認証について教えて" });

    expect(response.answer).toContain("これはダミー回答です。");
    expect(response.references).toEqual([
      {
        title: "サンプル仕様書",
        url: "/viewer/sample",
      },
    ]);
  });
});
