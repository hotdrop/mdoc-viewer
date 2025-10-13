import path from "node:path";

export type NormalizedDocPath = {
  readonly relativePath: string;
  readonly segments: string[];
  readonly viewerPath: string;
};

const DEFAULT_FILE = "index.txt";
const EXTENSION = ".txt";

export function normalizeDocPath(raw?: string[] | string): NormalizedDocPath {
  const joined = Array.isArray(raw) ? raw.join("/") : raw ?? "";
  const trimmed = joined.trim();
  const normalized = path.posix.normalize(trimmed || ".");
  const normalizedEndsWithSlash = normalized.endsWith("/");

  if (normalized === ".." || normalized.startsWith("../")) {
    throw new Error("許可されていないパスです。");
  }

  let sanitized = normalized.replace(/^\.\/?/, "");
  if (sanitized === ".") {
    sanitized = "";
  }

  const sanitizedSegments = sanitized.split("/").filter(Boolean);
  const lastSegment = sanitizedSegments.at(-1) ?? "";
  const hasExtension = path.posix.extname(lastSegment) === EXTENSION;

  const isDirectory =
    sanitized === "" ||
    normalizedEndsWithSlash ||
    (Array.isArray(raw) && raw.length === 0) ||
    (Array.isArray(raw) && raw.length === 1 && !hasExtension);

  let relativePath = sanitized;

  if (isDirectory) {
    relativePath = path.posix.join(relativePath, DEFAULT_FILE);
  }

  if (!relativePath.endsWith(EXTENSION)) {
    relativePath += EXTENSION;
  }

  relativePath = stripLeadingSlash(path.posix.normalize(relativePath));

  if (relativePath === ".." || relativePath.startsWith("../")) {
    throw new Error("許可されていないパスです。");
  }

  const segments = relativePath
    .slice(0, -EXTENSION.length)
    .split("/")
    .filter(Boolean);

  const viewerPath =
    segments.length > 0 ? `/viewer/${segments.join("/")}` : "/viewer";

  return {
    relativePath,
    segments,
    viewerPath,
  };
}

export function resolveRelativeDocPath(
  currentRelativePath: string,
  target: string,
): NormalizedDocPath {
  if (!currentRelativePath.endsWith(EXTENSION)) {
    throw new Error("現在のドキュメントパスが不正です。");
  }

  const baseDir = path.posix.dirname(currentRelativePath);
  const combined = path.posix.join(baseDir, target);
  return normalizeDocPath(combined);
}

export function stripLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "");
}

export function resolveLocalFullPath(
  root: string,
  relativePath: string,
): string {
  const normalizedRoot = path.resolve(root);
  const absolute = path.resolve(normalizedRoot, relativePath);
  if (
    absolute !== normalizedRoot &&
    !absolute.startsWith(`${normalizedRoot}${path.sep}`)
  ) {
    throw new Error("許可されていないローカルファイルパスです。");
  }
  return absolute;
}
