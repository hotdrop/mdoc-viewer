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
