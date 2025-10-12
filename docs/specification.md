# ドキュメントビューワWebアプリ

## 1. プロジェクト概要
本プロジェクトは`Google Cloud Storage`(GCS)に格納されたドキュメント(拡張子`.txt` だが内容は Markdown 形式)を、社員がブラウザで安全に閲覧できるようにする社内用ビューワアプリである。

## 2. 目的と非目的
- 目的
  - 社内ドキュメントを安全かつ見やすい形に整形して閲覧可能にすること
- 非目的
  - 編集機能(Markdownエディタは不要)
  - 外部共有機能(社外ユーザーアクセスは禁止)
  - `WYSIWYG`や履歴比較などの複雑なUI

## 3. 全体アーキテクチャ
* デプロイ: Cloud Run(Workload Identity使用で鍵レス運用)
* ストレージ: GCS(Uniform bucket-level access + Public access prevention)
* 認証: Firebase Authentication
* フロント: Next.js App Router(TypeScript)
* 実行ランタイム: Node

```
[Browser] → Firebase Auth(Emulator|Prod)
   │
   ▼ ID Token
[Next.js on (node)]
   ├─ Mode=local → LocalFsRepository  → {LOCAL_DOCS_ROOT}
   └─ Mode=cloud → GcsRepository      → {GCS_BUCKET}  (Workload Identity)
```

リポジトリ層を抽象化する。`DocumentRepository`インターフェースに対し、`LocalFsRepository`と`GcsRepository`を実装する。
将来的に画像・添付ファイルを扱う必要が出てきた場合は`MediaRepository`同様の二実装で合わせることが可能。
モード切替時もUI／レンダラ／ルーティングは不変。

## 4. 実行モード設計(Local / Cloud)
ローカルPC上で動かし動作確認をするため、本システムは実行モードでデータソースと周辺サービス接続を切り替える。
起動時の単一構成値(`RUN_MODE=local|cloud`)で切り替える。

- Localモード
  - ローカルPC上で動作し、ローカルディレクトリ(ファイルルートを`LOCAL_DOCS_ROOT`で指定する。例: `./test_docs/`)のMarkdown(.txt)を読み込む。
  - クラウドやサービスは一切使わない。認証は`Firebase`のエミュレータを使用する。
  - `LocalFsRepository`が`./test_docs/` 配下の`.txt`ファイルを直接読み込み、ファイルの最終更新日時(mtime)を `ETag` として扱う。
- Cloudモード
  - `Cloud Run`上で動作し、FirebaseやGCSと接続する。
  - `GcsRepository` が`Workload Identity`経由で`GCS`にアクセスし、`generation`と`etag`を利用してキャッシュ整合を取る。

## 5. 認証・セキュリティ設計
認証は`Firebase Authentication`により行う。`Cloud Run`環境では`Authorization: Bearer`ヘッダで渡された`IDトークン`を `Firebase Admin SDK`で検証する。
  - `email_verified == true`かつ`email.endsWith("@xxxx.co.jp")`を満たすユーザーのみ許可
  - 未認証は`401`を返す。
  - 外部ドメインは`403`を返す。

Localモードでは `Firebase Emulator` を使用し、同一コードパスで検証動作を再現する。
`GCS`へのアクセスは`Cloud Run`の`Workload Identity`経由で行い、鍵ファイルは不要。`GCS`のオブジェクトは`Cloud Run`経由で取得されるが、仮に`GCS`の`URL`を直接共有しても`IAM`設定により外部からはアクセスできない。

### 5.1 HTTP ヘッダ
- `Last-Modified`を`ETag`と併用する(条件付きGETは `If-None-Match` 優先)
- HTTP仕様的には文字列で返す必要があるので`ETag`は`ETag: "1707727200000"`(mtimeのミリ秒文字列)のように引用符付きで返す。
- `Content-Security-Policy: script-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'` を適用。

### 5.2 認証ガード範囲
認証トークンの検証は`Next.js`の`Route Handler`層で実施し、全ページは`SSR/RSC`レベルで`Layout`ガードを行う。

### 5.3 XSS対策
安全な最小構成をベースポリシーとして定義し、許可拡張は別モジュールで上書き可能にする。
- 既定許可: `p, h1–h6, ul/ol/li, strong/em, code/pre, table系, a[href]`
- `img`は扱わない
- `extraPolicy`を`sanitize/policy.extra.ts`に定義すれば上書き適用される

### 5.4 環境変数
このアプリは初期設計において恒常的に保持すべき秘匿情報は基本発生しないため、全て環境変数で管理する。
ただし、漏洩すると攻撃面が増える（推測名前で列挙試行・エラーメッセージ誘導）ので、環境変数はログ/エラー本文に出力しないこと。

- Firebase関連
 - FIREBASE_PROJECT_ID(識別子)
 - FIREBASE_WEB_API_KEY(公開前提／フロント埋め込みOK)
 - FIREBASE_AUTH_EMULATOR_HOST(Local時のみ／接続先)
- ドメイン制限
 - ALLOWED_DOMAIN(例: example.co.jp)
- GCS関連
 - GCP_PROJECT_ID(識別子)
 - GCS_BUCKET(バケット名。公開情報ではないが秘匿性は不要)
- 実行フラグ
 - RUN_MODE(local|cloud)

## 6. 機能
### 6.1 ドキュメントファイル取得
Local/Cloud 両モードとも、テキストを文字列として返し後述の`Markdown`レンダリング層で整形表示する。`GCS`のオブジェクトはサーバ経由でのみ取得され、直リンクアクセスは禁止とする。
また、このアプリでは画像ファイルは扱わない。`Markdown`内で画像を埋め込むことは想定せず必要に応じて外部URLリンクで参照する。

### 6.2 Markdownレンダリングとリンク解決
取得したテキストは`Markdown`としてHTMLに変換する。この処理は共通の`MarkdownRenderer`コンポーネントに集約し、ビュー層では単一の呼び出しで済む設計とする。
- パーサ構成: `remark` → `rehype`パイプラインを採用。`rehype-sanitize` により危険なタグ(script, iframe など)を除去。
- 目次とアンカー: `rehype-slug`と`rehype-autolink-headings`で見出しにIDとアンカーリンクを付与し、`rehype-toc`で h2〜h4 の目次を生成。
- コードハイライト: `Prism`ベースで自動言語判定。
- 相対リンク変換: Markdown 内リンクおよび `/viewer/[...path]` の解決は以下の簡易ルールで処理する。
  - `path.normalize()`により正規化し、必ず`DOCS_ROOT`配下に収まることを検証。ルート外に出る場合は404。
  - ファイル拡張子は`.txt`固定。ディレクトリ指定時は`index.txt`を優先。
  - 相対リンク(`./foo, ../bar`)はアプリ内ルーティング`/viewer/...`に変換。
- 拡張仕様: Frontmatter(YAML形式)を先頭で検出した場合はタイトルなどのメタ情報として利用できる。

### 6.3 トップ画面(リリースノート+更新一覧)
トップ画面は社員が更新内容を俯瞰できるポータルである。
1. リリースノート表示
   1. 固定パス(例: `release-notes.txt`)の`Markdown`ファイルを取得し、`MarkdownRenderer`で整形表示。
   2. キャッシュ制御は通常文書と同一(`ETag`/60秒TTL)。
2. 更新ドキュメント一覧
   1. `DocumentRepository.listRecentDocuments(limit=20)` により更新日時降順で取得。
   2. Localモードでは`mtime`, Cloudモードでは`GCS`の`updated`メタデータを参照。
   3. 一覧にはタイトル・更新日・リンクを表示する。

### 6.4 検索機能
`/search` は外部APIサーバは使わず`Next.js`内完結で実装する。サーバ(`RSC/SSR`)で `DocumentRepository` から検索用メタデータを収集し、ページに埋め込む。クライアントはその埋め込みデータに対して`Fuse.js`でインメモリ検索を実行する。必要に応じて同一Next.js内の `Route Handler`でメタデータ収集を分離してもよいが、どちらの場合も認証・権限制御はサーバ側で評価する。

対象データは各ドキュメントの`title`(Frontmatter),`path`(`/viewer/...`)、`updatedAt`(`mtime` or `GCS updated`)、`excerpt`(先頭数百文字)、`headings`(h2〜h3 抜粋)。
収集は Local/Cloud 両モードで `DocumentRepository.listIndexable()` を用い、後述する`7. キャッシュ`の方針に従って再検証する。

検索ロジックはクライアントで`Fuse.js`を初期化し、キー重み付け(例: `title:0.6`, `headings:0.3`, `excerpt:0.1`)と日本語向けオプション(`includeMatches:true`, `ignoreLocation:true` など)を指定する。
入力はクエリパラメータ`?q=...`と入力欄の双方を受け付け、ルーティング遷移時にサーバ埋め込みメタデータを再取得する。結果は `title / snippet / updatedAt / path` で一覧表示し、選択時に `/viewer/...` へ遷移する。

規模制約は数百件程度を想定する。メタデータ件数が 800件超 または JSONサイズ 2.5MB超の場合、`Route Handler`でサーバ検索に切替える。外部プロセスは増やさない。認証ガードは `/search` ページ表示時点で必ず実施し、未認証は 401 を返す。

### 6.5 ルーティング
アプリ全体のルート構成は次の通り。

| パス                  | 内容                       |
| ------------------- | ------------------------ |
| `/`                 | トップ画面(リリースノート＋更新一覧)      |
| `/viewer/[...path]` | ドキュメント詳細(Markdown整形済み表示) |
| `/docs/[...path]`   | テキスト取得API(JSONレスポンス)     |
| `/search`           | 検索結果一覧表示                 |

`/viewer/foo/bar`は`foo/bar.txt`に対応し、`index.txt`を優先表示する。各ルートは認証済みセッション下でのみ利用可能。

## 7. キャッシュ
すべてのドキュメントとメディア取得APIは、`ETag`に基づく条件付き`GET`をサポートする。

- Localモード: ファイルの`mtime`を`ETag`に変換。
- Cloudモード: `GCS`の`generation`/`etag`を使用。
- ヘッダー制御: 
  - `Cache-Control: max-age=60, stale-while-revalidate=120`
  - 一定時間内の再アクセスでは`304`応答を返し、帯域を節約する。

このキャッシュ制御は`Markdown`本文、リリースノート、メディア配信のすべてに共通する。

## 8. 運用と可観測性
- Local/Cloudモードともアクセスログに`userId`(Local EmulatorはダミーUID), `path`, `status`, `mode`を記録。
- Cloudモードでは構造化ログで可観測性を担保。

## 9. デプロイとCI/CD
- Localモードは`Docker`での起動を行い、`Firebase Emulator Suite`とローカルディレクトリを使う。ボリュームマウントで`LOCAL_DOCS_ROOT`を注入する。
- Cloudモードは`Cloud Build`→`Cloud Run`。`Workload Identity`で`storage.objects.get`等の最小権限を付与。

## 10. パフォーマンス要件
* 平均表示速度 1秒以内(キャッシュヒット時)。
* 304レスポンスで帯域最適化。
