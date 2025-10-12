# Guidelines

## Top Priority Rule
The top priority rules listed here always take precedence over all other rules and decisions and must never be broken under any circumstances.

- When a user asks a question, compares ideas, or discusses a policy, the system first responds with an explanation, suggestion, or recommendation, and does not begin pasting code or modifying files until it receives explicit implementation instructions from the user.
- Implementation and file changes will only be carried out if there is clear agreement from the user, such as "Please implement it according to this policy." Until agreement is reached, confirmation questions will be asked as necessary, and the user's intentions and wishes will be given top priority and respected.

## Overall Rules
- Please answer in Japanese.
- Please provide a detailed explanation in Japanese.
- Please provide all the implementation code without omissions.
- Please clearly explain the justification and reason for the change, and the intention of the implementation.
- Please adhere to the basic principles of software development, such as the DRY principle, YAGNI, and SOLID principle. However, it is okay to prioritize the conventions of Android, and Kotlin over the principles.

## Context1. 技術スタックと禁止事項
* Node.js LTS 20/22, Next.js App Router, webpack
* パッケージマネージャは`pnpm`
* 禁止: Turbopack, Bun, 本番Edge Runtime, 外部検索基盤や別マークダウンレンダラの追加、サードパーティCDN/署名URL導入
* サーバ優先: 認証・権限・データ取得は必ずサーバ側で評価。クライアントは描画のみ

## 2. ディレクトリ規約（目安）
```
src/
  app/                 # App Router
    (routes...)        # /, /viewer/[...path], /docs/[...path], /search
  lib/
    auth/              # トークン検証・ドメイン判定
    repo/              # DocumentRepository( LocalFs / Gcs )
    md/                # remark/rehypeパイプライン・sanitize
    cache/             # ETag/Last-Modified/TTLヘルパ
    path/              # 正規化・ルート外拒否ユーティリティ
  server/headers/      # 共通レスポンスヘッダ(CSP, Vary等)
  types/               # 共有型（/docsレスポンス等）
sanitize/
  policy.ts            # ベースポリシー
  policy.extra.ts      # 追加許可（存在すればマージ）
```

## 3. 依存ポリシー
* 追加可能: `remark`/`rehype`/`rehype-sanitize`、`prismjs`（サーバサイド使用）、`fuse.js`、`@google-cloud/storage`、`firebase`/`firebase-admin`。
* それ以外のライブラリ追加はPRで明示承認が必要。代替実装が容易なユーティリティは自前実装を優先。

## 4. セキュリティ実装ルール
* 認証搬送: `Authorization: Bearer <ID token>`。全Route Handlerで検証+LayoutでSSRガード。`Vary: Authorization` を必ず付与。
* CSP: `script-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'` を共通レスポンスヘッダで適用。
* サニタイズ: `rehype-sanitize` のベースポリシー固定+ `policy.extra.ts` で任意拡張（存在すればマージ）。`img`は不許可。
* パス防御: 受け取ったパス/相対リンクは正規化→ルート外拒否を共通関数で行い、`.txt`固定・`index.txt`優先を強制。
* 情報漏洩防止: エラーメッセージ・ログに環境変数やバケット名を出さない。ユーザ識別はuidで行う（emailはログ出力禁止）。

## 5. キャッシュ/ヘッダ規約
* 条件付きGET: `ETag` + `Last-Modified` を両建てし、`If-None-Match` 優先で304を返す。
* Cache-Control: `private, max-age=60, stale-while-revalidate=120` を既定。
* これらはヘルパにまとめ、全エンドポイントで統一適用。

## 6. 検索のフェイルオーバー運用
* 埋め込みメタデータが 800件超 or 2.5MB超 で自動的にサーバ検索へ切替（30s TTL）。
* 切替はUI透過（クエリUXは不変）。実装はRoute Handler内に閉じる。

## 7. ログ/可観測性
* 構造化ログ: `{ uid, path, status, mode, route }`。失敗時は `reason` を付与（機微情報は含めない）。
* Cloud Runでは標準出力ログのみを使用。独自外部転送はしない。

## 8. テスト最小セット
* ユニット: パス正規化・ルート外拒否、ETag/304分岐、サニタイズ禁止ケース（`javascript:`等）。
* スナップショット: XSSフィクスチャ複数（許可/拒否）。
* E2E（スモーク）: 未認証→401、許可ドメイン→200、`/viewer`でMarkdownが整形表示、検索が閾値未満でクライアント/閾値超過でサーバ検索へ切替。

## 9. デプロイ/実行
* ランタイムは Node.js 20/22 固定。`next build && next start`。
* Dockerは最小レイヤ・`.dockerignore`最適化（`node_modules`/`.next/cache`除外）。
* 環境変数はサーバ専用（WEB_API_KEYのみクライアント可）。ビルド時のインライン化禁止。

## 10. アンチパターン（禁止）
* サニタイズを通さない `dangerouslySetInnerHTML`。
* クライアントからのGCS直叩き・直リンク露出。
* Turbopack/Bun/Edge Runtime（本番）。
* 仕様外のルート・フラグ・ヘッダ追加。
* 「便利そうだから」との理由による外部サービス導入。

## 11. Doneの定義
* 仕様の該当章を満たす実装+テスト（上記最小セット）+手動動作確認（`/`, `/viewer`, `/search`）。
* 304挙動/認証ガード/CSP/XSSフィクスチャが通ること。
* PRに検証手順と結果を記載し、レビューで再現可能。

# Lastly
After reading these rules, please display [READ AGENTS RULES]