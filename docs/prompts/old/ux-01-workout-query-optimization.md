# 筋トレ一覧のクエリ最適化（DB 側カテゴリフィルタ＋候補用軽量クエリ）

以下の内容を実装してください。

## 背景

`app/composables/useWorkout.ts` の `fetchList(category)` は常に `workout_records` を全件取得し、クライアント側の `.filter()` でカテゴリを絞り込んでいる。`app/pages/workout/index.vue` の `useAsyncData` はカテゴリごとにキー（`workout-${category}`）が変わるたびに `fetchList` を再実行するため、**タブを切り替えるたびに全カテゴリの全件をネットワーク越しに再取得**している。全件保持はメニュー候補（`menuSuggestions` / `getMenuCandidates`）の算出が目的だが、候補に必要なのは `menu` / `category` の2列だけである。

## 変更内容

1. 一覧表示用クエリ：`fetchList(category)` で category 指定時は `.eq('category', category)` を付けて DB 側で絞り込む
2. メニュー候補用クエリ：`select('menu, category')` の軽量クエリに分離する。取得タイミングは初回フェッチ時と `create` 成功時など、候補の鮮度が保てる最小限の設計にする
3. 全件・全列を保持する `allRecords` は廃止するか、候補用の軽量データに置き換える
4. `useAsyncData` のキー（`workout-${category}`）とクエリ内容を一致させ、同一カテゴリ再訪時に Nuxt のキャッシュが効くようにする
5. CLAUDE.md の「`useWorkout` のカテゴリ絞り込みは全件取得後のクライアントフィルタ」という記述を実装に合わせて更新する

## 対象範囲・制約

- 対象：`app/composables/useWorkout.ts`、`app/pages/workout/index.vue`、関連テスト、CLAUDE.md の該当記述
- `menuSuggestions` / `getMenuCandidates` の外部から見た振る舞い（返る候補の内容）は維持する
- 並び順は引き続きクライアント側の `sortByDate`（`~/utils/sort`）でよい。ページネーション導入は `ux-06-pagination.md` で別途行う
- 過剰実装を避け、この最適化に必要な変更のみ行う

## 完了条件

- カテゴリタブ切り替え時に発行されるクエリに `.eq('category', ...)` が付いていることをテストで検証する（`test/mocks/supabase.ts` のモックのクエリチェーン呼び出しを確認）
- メニュー候補が従来どおり表示される（既存テストが通る、または追従修正済み）
- `npm run test` と `npm run lint` が通る

## 関連

- `ux-13-menu-suggestions-order.md`（候補の並び順改善）は同じ関数を触るため、続けて実施する場合は本プロンプト → ux-13 の順を推奨
