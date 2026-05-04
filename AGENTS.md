# Guidelines

## Top Priority Rules

These rules always take precedence over lower-level project guidance.

- 回答は日本語で行う。
- ユーザーが質問、比較、方針相談をしている段階では、まず説明・提案・確認を行い、明示的な実装指示があるまでファイル変更を開始しない。
- 実装やファイル変更は、ユーザーから「実装して」「この方針で進めて」などの明確な合意がある場合のみ行う。
- ユーザーの意図と希望を最優先し、不明点が実装判断に影響する場合は確認する。

## Project Source of Truth

- 詳細仕様の一次情報は `docs/specification.md` とする。
- エージェント向け反復手順は `.codex/skills/md-doc-viewer/SKILL.md` を参照する。
- sanitize の許可方針は `sanitize/policy.ts` を基準にし、追加許可は `sanitize/policy.extra.ts` で行う。
- `AGENTS.md` は恒久ルールと作業前チェックに絞り、詳細仕様を重複管理しない。

## Technical Constraints

- Runtime: Node.js LTS 20/22.
- Framework: Next.js App Router with TypeScript and webpack.
- Package manager: `pnpm`.
- 禁止: Turbopack, Bun, production Edge Runtime, 外部検索基盤、別Markdownレンダラ、サードパーティCDN、署名URL導入。
- 認証・権限・データ取得はサーバ側で評価する。クライアントは描画と操作に集中させる。
- 追加可能な依存は `remark`/`rehype`/`rehype-sanitize`, `prismjs`, `fuse.js`, `@google-cloud/storage`, `firebase`/`firebase-admin` を基本とする。
- 方針外のライブラリ追加は明示承認を取る。容易なユーティリティは自前実装を優先する。

## Architecture Guide

```text
src/
  app/                 # App Router routes
  lib/
    auth/              # token verification and domain checks
    repo/              # DocumentRepository, LocalFs, GCS
    md/                # remark/rehype pipeline and sanitize
    cache/             # ETag, Last-Modified, TTL helpers
    path/              # path normalization and root escape prevention
  server/headers/      # common response headers
  types/               # shared response/domain types
sanitize/
  policy.ts            # base sanitize policy
  policy.extra.ts      # optional extension policy
```

既存の配置・命名・抽象境界を優先し、不要な新規抽象や仕様外ルートを追加しない。

## Security Invariants

- 認証搬送は `Authorization: Bearer <ID token>` を使う。
- 全 Route Handler で認証を検証し、保護ページは Layout でSSRガードする。
- 認証依存レスポンスには `Vary: Authorization` を付与する。
- 共通CSPは `script-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'` を維持する。
- Markdown HTML は `rehype-sanitize` を通し、sanitize なしの `dangerouslySetInnerHTML` を禁止する。
- `img` は許可しない。
- 受け取ったパスと相対リンクは共通関数で正規化し、ルート外参照を拒否する。文書拡張子は `.txt` 固定、ディレクトリは `index.txt` 優先とする。
- エラー本文・ログに環境変数、バケット名、email、トークンなどの機微情報を出さない。ユーザー識別は `uid` を使う。

## Cache and Headers

- 条件付きGETは `ETag` と `Last-Modified` を併用する。
- `If-None-Match` を優先して `304` を返す。
- 既定の `Cache-Control` は `private, max-age=60, stale-while-revalidate=120` とする。
- ヘッダ処理は共通ヘルパに集約し、エンドポイントごとの差分を作らない。

## Search and Logging

- 検索メタデータが 800件超、または 2.5MB超の場合はサーバ検索へ切り替える。
- 検索切り替えはUI透過とし、クエリUXを変えない。
- 構造化ログは `{ uid, path, status, mode, route }` を基本とし、失敗時のみ安全な `reason` を付ける。
- Cloud Run では標準出力ログを使い、独自外部転送は追加しない。

## Work Checklist

- 作業前に `docs/specification.md` と関連実装を確認する。
- セキュリティ、Markdown、検索、Route Handler、リポジトリ層、テスト追加に関わる作業では `.codex/skills/md-doc-viewer/SKILL.md` を参照する。
- エージェント・CI・完了検証ではウォッチ実行の `pnpm test` ではなく、非ウォッチの `pnpm exec vitest run` を使う。
- localStorage などクライアント内永続化を追加する場合は、保存キー、保存範囲、最大件数、破損データ・利用不可時の挙動、テスト観点を実装前に明記する。
- 変更は DRY, YAGNI, SOLID を意識しつつ、Next.js と TypeScript の既存慣習を優先する。
- 既存のユーザー変更を巻き戻さない。

## Rule Maintenance Feedback

実装や開発タスクの完了後は、毎回必ず `task/feedback.md` に開発改善フィードバックを追記する。チャット欄の完了報告には詳細を再掲せず、`task/feedback.md` に追記したことだけを簡潔に記載する。

- `task/feedback.md` の既存記載は削除・上書きせず、末尾に追記して蓄積する。
- 追記は必ず `# YYYY/M/D HH:mm フィードバック` 形式の見出しで開始し、見出しに書き込んだ日時を含める。
- 追記には必ず簡単な作業内容を含める。「なし」だけの記録は禁止し、候補がない場合も確認した観点と理由を短く書く。
- フィードバック対象は `AGENTS.md` だけに限定しない。`.codex/skills/md-doc-viewer/SKILL.md`、`docs/`、README、`task/` の作業メモ、テスト・検証手順、開発導線など、開発を改善できる点を幅広く洗い出す。
- 既存ルールや手順が障壁になった点、改善した方がよい点、追加した方がよい点、ドキュメントやテストへ反映した方がよい点を記録する。
- 洗い出した候補を、特定の実装やタスクに限定できるものと、恒久的に適用できるものに分類する。
- 特定の実装やタスクに限定できるものは `.codex/skills/md-doc-viewer/SKILL.md`、`docs/`、README、`task/`、テスト・検証手順などの更新候補とする。
- 恒久的に適用できるものは `AGENTS.md`、または `AGENTS.md` から参照するルールファイルの更新候補とする。
- ルールやドキュメントの更新は、ユーザーの明示的な合意がある場合のみ実施する。

## Definition of Done

- 仕様の該当章を満たす実装とテストがある。
- 最小テスト対象: パス正規化・ルート外拒否、ETag/304分岐、sanitize禁止ケース、検索切り替え。
- 手動確認対象: `/`, `/viewer`, `/search`。
- 304挙動、認証ガード、CSP、XSSフィクスチャが確認されている。
- PRや完了報告には検証手順と結果を記載し、レビューで再現可能にする。
