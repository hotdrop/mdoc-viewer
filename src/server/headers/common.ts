type BuildCspOptions = {
  nonce?: string;
  allowUnsafeEval?: boolean;
};

export function buildContentSecurityPolicy(options: BuildCspOptions = {}): string {
  const directives: string[] = [];
  const scriptSources = ["'self'"];
  if (options.allowUnsafeEval) {
    scriptSources.push("'unsafe-eval'", "'wasm-unsafe-eval'");
  }
  if (options.nonce) {
    scriptSources.push(`'nonce-${options.nonce}'`);
  }
  directives.push("default-src 'self'");
  directives.push(`script-src ${scriptSources.join(" ")}`);
  directives.push(
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  );
  directives.push("form-action 'self'");
  directives.push("img-src 'self' data:");
  directives.push("base-uri 'none'");
  directives.push("frame-ancestors 'none'");
  directives.push("object-src 'none'");
  return directives.join("; ");
}

export const DEFAULT_CSP = buildContentSecurityPolicy();

export function applyCommonSecurityHeaders(
  headers: Headers,
  options?: BuildCspOptions,
): void {
  headers.set("content-security-policy", buildContentSecurityPolicy(options));
  const varyCurrent = headers
    .get("vary")
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? [];
  for (const value of ["Cookie", "Authorization"]) {
    if (!varyCurrent.includes(value)) {
      varyCurrent.push(value);
    }
  }
  headers.set("vary", varyCurrent.join(", "));
}
