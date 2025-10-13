import type { Options as SanitizeOptions } from "rehype-sanitize";
import basePolicy from "../../../sanitize/policy";
import extraPolicy from "../../../sanitize/policy.extra";

let cachedPolicy: SanitizeOptions | null = null;

export async function loadSanitizePolicy(): Promise<SanitizeOptions> {
  if (cachedPolicy) {
    return cachedPolicy;
  }
  const merged = deepMergePolicy(basePolicy, extraPolicy);
  cachedPolicy = merged;
  return merged;
}

function deepMergePolicy(
  base: SanitizeOptions,
  extra: SanitizeOptions,
): SanitizeOptions {
  return {
    ...base,
    ...extra,
    tagNames: mergeArray(base.tagNames, extra.tagNames),
    attributes: {
      ...(base.attributes ?? {}),
      ...Object.fromEntries(
        Object.entries(extra.attributes ?? {}).map(([key, value]) => [
          key,
          mergeArray(base.attributes?.[key], value),
        ]),
      ),
    },
    protocols: {
      ...(base.protocols ?? {}),
      ...Object.fromEntries(
        Object.entries(extra.protocols ?? {}).map(([key, value]) => [
          key,
          mergeArray(base.protocols?.[key], value),
        ]),
      ),
    },
  };
}

function mergeArray<T>(base?: T[] | null, extra?: T[] | null): T[] {
  return Array.from(new Set<T>([...(base ?? []), ...(extra ?? [])]));
}
