# ローカル環境
ローカル環境でアプリを実行するためのコマンドと手順を記載します。
```sh
# エミュレータ起動(登録したテストユーザーを永続化)
firebase emulators:start --import=./firebase-data --export-on-exit

# 開発実行
pnpm dev

# 以下からログイン
http://localhost:3000/local-login
```

# テストユーザー
mytest@myproduct.test.jp / sample1111

# 環境変数サンプル
```
RUN_MODE=local
ALLOWED_DOMAIN=myproduct.test.jp
FIREBASE_PROJECT_ID=demo-no-project
FIREBASE_WEB_API_KEY=demo-no-project
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
LOCAL_DOCS_ROOT=./test_docs/
```
