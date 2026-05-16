# 次のタスク
Webアプリ起動時のファーストビューにおいて、トップ画面のドキュメントが現在以下のようになってるという理解で良いですかね？

- ローカル: `/schedules/`
- Cloud Storage: `/`

これは非常にわかりづらいので、たとえば以下のようにする案はどう思います？

- ローカルも Cloud Storageも`/`に配置したドキュメントを表示する。
- ドキュメントを`release_note`や`schedules`と固定すると汎用性がなくなるので以下のようにしたい。
  - `index.txt`: release_noteやschedulesを書く
