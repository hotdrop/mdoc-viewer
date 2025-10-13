# ドキュメントビューワ
このアプリはドキュメントビューワです。

## セットアップ

1. 依存関係をインストールします。
```bash
pnpm install
```

2. 必要な環境変数を設定してください（例: `.env.local`）。
| 変数名 | 説明 |
| --- | --- |
| `RUN_MODE` | `local` または `cloud` |
| `ALLOWED_DOMAIN` | 許可ドメイン (`example.co.jp` 等) |
| `FIREBASE_PROJECT_ID` | Firebase プロジェクト ID |
| `FIREBASE_WEB_API_KEY` | クライアント用 API キー |
| `FIREBASE_AUTH_EMULATOR_HOST` | Local モード時の認証エミュレータ (`localhost:9099` 等) |
| `LOCAL_DOCS_ROOT` | Local モードのドキュメントディレクトリ |
| `GCP_PROJECT_ID`, `GCS_BUCKET` | Cloud モードで使用 |

## 開発サーバの起動
```bash
pnpm dev
```

## テスト
単体テストおよびスナップショットテストを実行します。
```bash
pnpm test
```

## ビルド
```bash
pnpm build
pnpm start
```

## TODO
### 手動確認
`pnpm dev` を実行後、以下を開き401/403 ガード・304 挙動・検索モード切替を確認。
 - `http://localhost:3000/`
 - `http://localhost:3000/viewer/...`
 - `http://localhost:3000/search`
### Firebaseのエミュレータ確認
エミュレータ利用時に環境変数が正しく設定されているか確認するため、`FIREBASE_AUTH_EMULATOR_HOST`を指定した状態で`pnpm dev`を実行し、認証 API がエミュレータに向いていることを手動で確認してください。
