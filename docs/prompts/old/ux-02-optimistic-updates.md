# 作成・更新・削除後の全件再フェッチを楽観的更新に置き換える

以下の内容を実装してください。

## 背景

`useDailyNew` / `useTopics` / `useWorkout` の `create` / `update` / `remove` は、すべて成功後に `await fetchList()` を呼んで DB へ全件を再問い合わせしている。1 操作ごとに不要なネットワーク往復が発生し、体感速度が落ちる。

## 変更内容

1. Supabase の `insert().select()` / `update().select()` のレスポンス行を直接ローカル配列（`items`）へ反映する
   - 作成：返却行を配列に追加し、現在の `sortOrder` に合った位置を保つ
   - 更新：該当要素を返却行で置換する
   - 削除：該当要素を配列から除去する
2. 成功後の `await fetchList()` 呼び出しを廃止する
3. エラー時は従来どおり `error.value` にメッセージをセットする。ローカル状態と DB がずれた可能性がある場合のみ、ロールバックとして再フェッチする
4. `useWorkout` はメニュー候補用データへの反映も行う（新しいメニュー名が候補に現れること）

## 対象範囲・制約

- 対象：`app/composables/useDailyNew.ts` / `useTopics.ts` / `useWorkout.ts` と各テスト
- 各 composable の公開 API（返却するプロパティ・関数のシグネチャ）は変えない
- 過剰実装を避け、再フェッチ廃止に必要な変更のみ行う

## 完了条件

- 各 composable のテストで「`create` / `update` / `remove` 成功後に一覧の再 `select` が実行されない」ことを検証する
- 操作後の `items` の内容・並び順が再フェッチ時と同等であることをテストで確認する
- `npm run test` と `npm run lint` が通る

## 関連

- `ux-01-workout-query-optimization.md` と同じファイル（`useWorkout.ts`)を触るため、両方実施する場合は ux-01 を先に行う
- `ux-06-pagination.md` を後で導入する際は、ローカル反映とページ境界の整合に注意する
