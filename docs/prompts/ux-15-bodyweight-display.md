# 自重種目の「0kg」表示を「自重」に切り替える

以下の内容を実装してください。

## 背景

`WorkoutList.vue` は常に `{{ item.intensity }}kg × {{ item.reps }}回` と表示する。懸垂・腕立て伏せなどの自重種目を重量0で記録すると「0kg × 10回」という表記になり、「0kg」が未入力に見えて不自然。

## 変更内容

1. `WorkoutList.vue` で `intensity === 0` のとき「自重 × {reps}回」と表示する（それ以外は現状どおり `{intensity}kg × {reps}回`）
2. 表示ロジックが式として複雑になるなら、純粋関数（例：`app/utils/` の `formatIntensity`）に切り出す

## 対象範囲・制約

- 対象：`app/components/WorkoutList.vue`（＋必要なら utils）、関連テスト
- 表示の切り替えのみ。「自重種目フラグ」のようなスキーマ変更はスコープ外
- 入力フォーム側（`WorkoutForm.vue`）の変更もスコープ外

## 完了条件

- コンポーネント（または utils）テストで「intensity が 0 のとき『自重』表記、1以上のとき kg 表記」を検証する
- `npm run test` と `npm run lint` が通る
