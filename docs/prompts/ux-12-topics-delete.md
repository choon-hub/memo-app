# トピックに削除機能を追加する（3機能の非対称性の解消）

以下の内容を実装してください。

## 背景

一日一新は編集・削除の両方が可能、トピックは編集のみ、筋トレはどちらも不可という機能差がある。`useTopics` には `fetchList` / `create` / `update` はあるが `remove` が存在しない。この非対称性が意図的な仕様である可能性は低いが、確認は必要。

## 前提確認

実装を始める前に、トピックに削除機能がないのが意図的な仕様かどうかをユーザーに確認する。意図的な場合はここで中止する。

## 変更内容

1. `useTopics` に `remove` を追加する。実装は `useDailyNew.ts` の `remove` をテンプレートにする
2. `TopicList.vue` に削除ボタンを追加する。マークアップ・CSS クラス・prop/emit の命名は `DailyNewList.vue` の削除まわりを踏襲する
3. 削除確認（`ux-03-delete-confirmation.md`）が実装済みであれば同じ確認パターンを適用する。未実装なら確認なしの既存パターンに合わせ、ux-03 実施時にまとめて対応する
4. `topics/index.vue` で `remove` を配線する

## 対象範囲・制約

- 対象：`app/composables/useTopics.ts`、`app/components/TopicList.vue`、`app/pages/topics/index.vue`、関連テスト
- 筋トレへの編集・削除追加はスコープ外（必要になったら別途）

## 完了条件

- composable テスト（`remove` 成功・失敗時の挙動）とコンポーネントテスト（削除ボタンの emit）を追加する
- `npm run test` と `npm run lint` が通る
