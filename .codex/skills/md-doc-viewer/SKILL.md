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

## Post-Task Development Feedback

After every implementation or development task, append development-improvement feedback to `task/feedback.md`. Do not replace or delete existing entries. In the final chat report, only state briefly that feedback was appended; do not duplicate the full feedback text.

Use this format:

```md
# YYYY/M/D HH:mm フィードバック

## 作業内容
- ...

## 開発改善フィードバック
- 既存ルール・手順が障壁になった点: ...
- 改善した方がよいルール・手順: ...
- 追加した方がよいルール・手順: ...
- docs/README/タスクメモ/テストなどへ反映した方がよい点: ...

## 分類
- タスク固有: ...
- 恒久対応候補: ...

## 更新先候補
- AGENTS.md: ...
- .codex/skills/md-doc-viewer/SKILL.md: ...
- docs/README/task/tests など: ...
```

Requirements:

- Always start each entry with a heading in the exact form `# YYYY/M/D HH:mm フィードバック`, using the write timestamp.
- Always include a short summary of the task.
- Do not write only "なし". If there are no candidates, briefly state which areas were checked and why no update is needed.
- Treat "rules" as both `AGENTS.md` and this `SKILL.md`, plus any files referenced from them.
- Also consider broader development improvements, including `docs/`, README files, task notes, tests, fixtures, verification steps, local setup, and developer workflow.
- Classify each candidate as task-specific or permanent.
- Task-specific candidates usually belong in this `SKILL.md`, `docs/`, README, `task/`, tests, or verification notes.
- Permanent candidates usually belong in `AGENTS.md` or a rule file referenced from it.
- Do not update rule or documentation files from feedback unless the user explicitly approves that update.
