# 2026/5/16 16:09 フィードバック

## 作業内容
- Chat形式の質問UI、`/api/chat` Route Handler、ダミー回答サービス、関連型定義、テストを追加した。

## 開発改善フィードバック
- 既存ルール・手順が障壁になった点: Vitest の JSX 変換では一部 client component に `React` の明示 import が必要で、Next.js 実行時との差分として原因特定に少し時間がかかった。
- 改善した方がよいルール・手順: React component を jsdom/Vitest で直接テストする場合の import 方針をテスト手順に明記するとよい。
- 追加した方がよいルール・手順: 新規 Route Handler 追加時に、共通セキュリティヘッダと `Vary: Authorization` を確認するテスト観点をテンプレート化するとよい。
- docs/README/タスクメモ/テストなどへ反映した方がよい点: Chat/RAG 連携が本実装へ進む前に、`src/lib/chat/service.ts` を差し替え境界とすることを作業メモへ残すとよい。

## 分類
- タスク固有: Chat の将来RAG接続境界、Chat UI のエラー表示・参照元リンク確認。
- 恒久対応候補: Vitest での React import 方針、Route Handler のセキュリティヘッダ確認観点。

## 更新先候補
- AGENTS.md: 恒久対応するなら Route Handler 追加時のヘッダテスト観点を追記候補。
- .codex/skills/md-doc-viewer/SKILL.md: UI component の jsdom テスト時に `React` import を確認する手順を追記候補。
- docs/README/task/tests など: Chat/RAG Core API 連携時の差し替え対象として `src/lib/chat/service.ts` を記録候補。

# 2026/5/16 16:39 フィードバック

## 作業内容
- Cloud Run向けにFirebase Googleログイン、Firebase session cookie認証、ログアウト、CSP/sanitize/logging強化、関連テストと仕様更新を実施した。

## 開発改善フィードバック
- 既存ルール・手順が障壁になった点: Cloud Runのブラウザ認証では`Authorization: Bearer`前提とsession cookie前提で設計が大きく変わるため、仕様上の認証搬送方針に補足が必要だった。
- 改善した方がよいルール・手順: Cloud modeの保護ページでは「Firebase ID tokenをクライアント状態として保持しない」ことを認証チェックリストに明記するとよい。
- 追加した方がよいルール・手順: Route Handlerの`Vary`はcookie認証導入時に`Cookie`を含める、ログ`reason`は固定コードのみ許可する、という検証観点を追加するとよい。
- docs/README/タスクメモ/テストなどへ反映した方がよい点: Cloud Runデプロイ手順に、未認証呼び出し許可、Firebase Google provider有効化、承認済みドメイン、`FIREBASE_AUTH_DOMAIN`の確認を追加するとよい。

## 分類
- タスク固有: Cloud RunでのFirebase Googleログイン導線、session cookie発行API、クライアントfetchからのBearer削除。
- 恒久対応候補: 本番ブラウザUIへID token/Bearerを露出しないルール、ログreason固定コード化、cookie認証時の`Vary: Cookie`確認。

## 更新先候補
- AGENTS.md: 恒久対応するなら本番認証トークンをClient Componentへ渡さないルールを追記候補。
- .codex/skills/md-doc-viewer/SKILL.md: Cloud Run認証レビュー時のsession cookie、`Vary: Cookie`、固定reasonコードの確認項目を追記候補。
- docs/README/task/tests など: Cloud Runデプロイ手順とFirebase Auth設定チェックリスト、session cookie route testの観点を追記候補。
