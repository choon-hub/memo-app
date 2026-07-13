# composable のモジュールスコープ state を useState へ移行する

以下の内容を実装してください。

## 背景

`useDailyNew` / `useTopics` / `useWorkout` の `items` / `loading` / `error` / `sortOrder` 等はすべてモジュールスコープの `ref`。Supabase クライアントをモジュールスコープに保持する判断は意図的（CLAUDE.md 明記）だが、データ本体まで同じにする必然性はなく、SSR では本来リクエストごとに独立させるべき状態がプロセス全体で共有される構造になっている。単一ユーザー前提の現状では実害は小さいが、SSR での同時リクエストを見据えた是正。

## 変更内容

1. 3つの composable の状態（`items` / `allRecords` / `loading` / `error` / `sortOrder` / `lastCategory` 等）を `useState`（キー付き）ベースに移行する
2. `useSupabase()` のシングルトンは現状のまま維持する（SupabaseClient は Nuxt payload にシリアライズできないため。CLAUDE.md 参照）
3. テストのモジュールスコープ state リセットパターン（`beforeEach` での初期化）を `useState` 前提の形に更新する。AGENTS.md「テスト方針」の該当記述も実装に合わせて更新する

## 対象範囲・制約

- 対象：3つの composable、全テスト（state リセット部分）、AGENTS.md / CLAUDE.md の該当記述
- composable の公開 API は変えない
- 優先度は低い改善のため、他のプロンプト（特に ux-01 / ux-02）と同時に実施せず、単独のブランチ・PR で行う

## 完了条件

- 既存の全テストが `useState` 前提のリセットで安定して通る
- `npm run test` と `npm run lint` が通る
- `npm run dev` で3ページの表示・作成・（機能があれば）編集/削除が動作することを確認する（`/verify` スキルが利用可能）
