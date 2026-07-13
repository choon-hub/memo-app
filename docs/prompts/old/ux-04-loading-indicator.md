# 一覧のローディング表示（スピナー）を追加する

以下の内容を実装してください。

## 背景

各 composable の `loading` は初回取得時（`items.length === 0`）しか `true` にならず、2回目以降の再フェッチ中はローディング表示が一切出ない。また、スピナーやスケルトン UI がアプリ全体に存在せず、`loading` はフォーム送信ボタンの `disabled` にしか使われていない。ユーザーには一覧が一瞬固まったように見える。

## 変更内容

1. 各 composable（`useDailyNew` / `useTopics` / `useWorkout`）の `fetchList` で、初回に限らずフェッチ中は `loading` を `true` にする
2. 一覧コンポーネントに `loading` prop を渡し、フェッチ中は簡易スピナーまたは薄い半透明オーバーレイ＋中央スピナーを表示する
   - `WorkoutList.vue` は現状 `loading` prop 自体を受け取っていないため、prop を追加する（他の List と同様に必須 prop とする）
3. スピナーは共通コンポーネント（例：`app/components/AppSpinner.vue`）として1つ作り、3機能で使い回す。CSS は `app/assets/global.css` の流儀に合わせる

## 対象範囲・制約

- 対象：3つの composable、`DailyNewList.vue` / `TopicList.vue` / `WorkoutList.vue`、各ページ、関連テスト
- スケルトン UI はスコープ外（スピナー/オーバーレイまで）
- 既存のフォーム送信ボタン `disabled` の挙動は維持する

## 完了条件

- コンポーネントテストで「`loading: true` のときスピナーが表示され、`false` のとき表示されない」ことを検証する
- `npm run test` と `npm run lint` が通る
