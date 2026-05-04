import { describe, expect, it } from "vitest";
import {
  RECENTLY_VIEWED_MAX_ITEMS,
  RECENTLY_VIEWED_STORAGE_KEY,
  readRecentlyViewedDocuments,
  saveRecentlyViewedDocument,
} from "@/lib/viewer/recentlyViewed";

describe("recently viewed documents", () => {
  it("新規保存で先頭に追加する", () => {
    const storage = createStorage();
    const entry = createEntry("/viewer/guide/intro", "はじめに", 1);

    expect(saveRecentlyViewedDocument(entry, storage)).toEqual([entry]);
    expect(readRecentlyViewedDocuments(storage)).toEqual([entry]);
  });

  it("同一 viewerPath は重複させず最新を先頭へ移動する", () => {
    const storage = createStorage();
    const oldEntry = createEntry("/viewer/guide/intro", "古いタイトル", 1);
    const anotherEntry = createEntry("/viewer/guide/detail", "詳細", 2);
    const updatedEntry = createEntry("/viewer/guide/intro", "新しいタイトル", 3);

    saveRecentlyViewedDocument(oldEntry, storage);
    saveRecentlyViewedDocument(anotherEntry, storage);
    saveRecentlyViewedDocument(updatedEntry, storage);

    expect(readRecentlyViewedDocuments(storage)).toEqual([
      updatedEntry,
      anotherEntry,
    ]);
  });

  it("最大件数に丸める", () => {
    const storage = createStorage();

    for (let index = 0; index < RECENTLY_VIEWED_MAX_ITEMS + 2; index += 1) {
      saveRecentlyViewedDocument(
        createEntry(`/viewer/doc-${index}`, `Doc ${index}`, index),
        storage,
      );
    }

    const documents = readRecentlyViewedDocuments(storage);
    expect(documents).toHaveLength(RECENTLY_VIEWED_MAX_ITEMS);
    expect(documents[0]?.viewerPath).toBe("/viewer/doc-9");
    expect(documents.at(-1)?.viewerPath).toBe("/viewer/doc-2");
  });

  it("破損 JSON は空配列として扱い、保存値を削除する", () => {
    const storage = createStorage();
    storage.setItem(RECENTLY_VIEWED_STORAGE_KEY, "{invalid");

    expect(readRecentlyViewedDocuments(storage)).toEqual([]);
    expect(storage.getItem(RECENTLY_VIEWED_STORAGE_KEY)).toBeNull();
  });

  it("不正形状は空配列として扱い、保存値を削除する", () => {
    const storage = createStorage();
    storage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([{ viewerPath: "../secret", title: "", viewedAt: "nope" }]),
    );

    expect(readRecentlyViewedDocuments(storage)).toEqual([]);
    expect(storage.getItem(RECENTLY_VIEWED_STORAGE_KEY)).toBeNull();
  });
});

function createEntry(
  viewerPath: string,
  title: string,
  minutes: number,
) {
  return {
    viewerPath,
    title,
    viewedAt: new Date(Date.UTC(2026, 0, 1, 0, minutes)).toISOString(),
  };
}

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  } as Storage;
}
