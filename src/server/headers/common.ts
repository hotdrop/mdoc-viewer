export const DEFAULT_CSP =
  "script-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'";

export function applyCommonSecurityHeaders(headers: Headers): void {
  headers.set("content-security-policy", DEFAULT_CSP);
  const varyCurrent = headers
    .get("vary")
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? [];
  if (!varyCurrent.includes("Authorization")) {
    varyCurrent.push("Authorization");
  }
  headers.set("vary", varyCurrent.join(", "));
}
