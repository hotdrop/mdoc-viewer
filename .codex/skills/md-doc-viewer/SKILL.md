---
name: md-doc-viewer
description: Use when implementing, reviewing, or verifying md-doc-viewer behavior, especially authentication, response headers, Markdown rendering and sanitization, document repository access, path normalization, search failover, logging, or tests.
---

# md-doc-viewer Skill

## When to Use

Use this skill before changing or reviewing:

- Route Handlers, protected layouts, or authentication flow
- `DocumentRepository`, LocalFs, or GCS access
- Markdown rendering, sanitize policy, heading/link handling, or `dangerouslySetInnerHTML`
- Cache headers, conditional GET, CSP, or `Vary`
- Search metadata collection, Fuse.js client search, or server-search failover
- Logging, error handling, environment handling, or tests

Read `docs/specification.md` for detailed product behavior. Treat this skill as the implementation checklist, not the full specification.

## Pre-Work Checklist

- Confirm the task has explicit implementation approval when it changes files.
- Read the relevant section of `docs/specification.md`.
- Inspect the current implementation before deciding on new APIs or abstractions.
- Prefer existing helpers under `src/lib/*` and `src/server/headers/*`.
- Avoid adding dependencies unless they are already allowed by `AGENTS.md` or explicitly approved.

## Implementation Rules

- Keep authentication, authorization, and data fetching on the server.
- Use `Authorization: Bearer <ID token>` for protected API access.
- Ensure protected Route Handlers verify tokens and protected pages are guarded in SSR/Layout.
- Preserve `Vary: Authorization` on auth-dependent responses.
- Apply common security headers through the shared helper; preserve the required CSP directives.
- Use shared cache helpers for `ETag`, `Last-Modified`, `Cache-Control`, and `304` decisions.
- Normalize all user-supplied paths and Markdown relative links through shared path utilities.
- Enforce `.txt` documents and `index.txt` directory fallback.
- Keep GCS access server-side only. Do not expose direct GCS links, signed URLs, or bucket details.
- Do not log env vars, tokens, bucket names, email addresses, or raw sensitive error details.

## Markdown and Sanitization

- Render Markdown through the existing remark/rehype pipeline.
- Always sanitize rendered HTML with the base policy from `sanitize/policy.ts`.
- Add optional sanitize allowances only through `sanitize/policy.extra.ts`.
- Keep `img` disallowed unless the project policy is explicitly changed.
- Do not introduce a second Markdown renderer.
- Do not use unsanitized `dangerouslySetInnerHTML`.
- Add or update XSS fixtures/tests when sanitize behavior changes.

## Search Rules

- Keep search inside the Next.js app; do not add external search infrastructure.
- Use embedded metadata plus Fuse.js while metadata is within limits.
- Switch to server search when metadata exceeds 800 items or 2.5MB.
- Keep failover transparent to the UI and preserve the query UX.
- Keep server-search TTL behavior aligned with the project specification.

## Review Checklist

- Does the change keep server-side auth and data access boundaries intact?
- Are CSP, `Vary: Authorization`, cache headers, and conditional GET behavior preserved?
- Are path traversal and root escape cases covered?
- Is sanitize applied before any HTML injection?
- Are logs structured as `{ uid, path, status, mode, route }` with safe `reason` values only?
- Are new dependencies necessary and allowed?
- Are tests focused on the changed risk area?

## Verification Checklist

Run the smallest relevant set first:

- `pnpm test`
- `pnpm lint`
- `pnpm build`

For affected behavior, verify:

- unauthenticated requests return `401`
- disallowed domains return `403`
- allowed users can view `/`, `/viewer/...`, and `/search`
- `ETag` match returns `304`
- CSP and `Vary: Authorization` are present
- XSS fixtures are sanitized
- search uses client mode below thresholds and server mode above thresholds
