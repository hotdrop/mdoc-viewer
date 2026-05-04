export function buildViewerResultHref(
  targetHref: string,
  searchQuery: string,
): string {
  const query = searchQuery.trim();
  if (!query) {
    return targetHref;
  }

  const [pathAndQuery, hash] = targetHref.split("#", 2);
  const separator = pathAndQuery.includes("?") ? "&" : "?";
  const href = `${pathAndQuery}${separator}searchQuery=${encodeURIComponent(query)}`;

  return hash ? `${href}#${hash}` : href;
}
