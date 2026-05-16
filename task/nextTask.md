# 次のタスク
私が`Cloud Run`デプロイ後に想定している認証アクセス

## 前提条件
- Cloud Runにデプロイする同GCPプロジェクトのFirebase Authenticationを有効にし、Google認証をONにする

## アクセス手順
- Webサイトにブラウザでアクセスする
- 決まっている会社のドメイン等`@company.jp`など固定で、Googleアカウントでログインする
- 決まっているドメインでGoogle認証できたらトップページを表示する。できなければエラーで終了