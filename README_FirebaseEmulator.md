# ローカル環境
ローカル環境でアプリを実行するためのコマンドと手順を記載します。
```sh
# エミュレータ起動
firebase emulators:start --import=./firebase-data --export-on-exit

# 開発実行
pnpm dev

# 以下からログイン
http://localhost:3000/local-login
```

**上記コマンド**
テストユーザーを永続化するためオプションをつけます。
初回は`firebase-data`ディレクトリが存在しなくても構いません。終了時に作成され、次回起動時に読み込まれます。

## 初回のエミュレータセットアップ
```sh
# Firebaseログイン
firebase login

# プロジェクト直下でfirebase init → Emulatorsを選び、少なくともAuthenticationにチェック。Functions/Firestoreなど既存コードに合わせて選択。
firebase init
```

環境変数に以下を設定する。クライアント側でFirebase Web SDKを使っていない構成なので、`NEXT_PUBLIC_...`のような環境変数は不要
```
RUN_MODE=local
ALLOWED_DOMAIN=myproduct.test.jp
FIREBASE_PROJECT_ID=test
FIREBASE_WEB_API_KEY=test
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
LOCAL_DOCS_ROOT=./test_docs/
```

## エミュレータ起動
本ドキュメントの冒頭に記載したコマンドでエミュレータを起動します。
1. 起動後に表示されるUIのURL（既定ではhttp://localhost:4000）を開きます。
2. `Authentication`タブを表示します。
3. テストユーザーを作成します。
   1. `mytest@myproduct.test.jp` / sample1111
   2. →環境変数の`ALLOWED_DOMAIN`で指定したドメインにします。

## IDトークン取得
エミュレータはREST API経由でサインインできます。上記で作成したユーザーのメールアドレスとパスワードを使い、次のようにIDトークンを取得してください。
```sh
curl -s -X POST \
  'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "mytest@myproduct.test.jp",
    "password": "your-password",
    "returnSecureToken": true
  }'
```
- `key=test`の値は`.env.local`で設定している`FIREBASE_WEB_API_KEY`と一致させてください。
- レスポンスの`idToken`が`Bearer`トークンとして利用できます。jqなどで取り出すと扱いやすいです。
