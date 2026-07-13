# 筋トレページのページレベルテストを追加する

以下の内容を実装してください。

## 背景

`app/pages/one-new/__tests__/index.spec.ts` と `app/pages/topics/__tests__/index.spec.ts` は存在するが、`app/pages/workout/__tests__/` ディレクトリ自体が存在しない。3機能中もっともロジックが複雑（カテゴリタブ・コピー機能・候補チップ・フェッチの絡み）な画面のテストカバレッジが最も薄く、AGENTS.md の「新機能・修正にはテストを追加すること」という方針とも整合しない。

## 変更内容

1. `app/pages/workout/__tests__/index.spec.ts` を新設する
2. 既存のページテスト（`one-new` / `topics` の `index.spec.ts`）のパターンを踏襲する：composable（`useWorkout`）と `#app/composables/asyncData` を mock する
3. 少なくとも以下を検証する：
   - 初期表示で一覧が描画される
   - カテゴリタブ切り替えで `fetchList` が該当カテゴリ付きで呼ばれる
   - フォーム submit で `create` が呼ばれる
   - エラー時にエラーメッセージが表示される

## 対象範囲・制約

- 対象：`app/pages/workout/__tests__/index.spec.ts` の新規追加のみ
- プロダクションコードの変更は行わない。テストを書く過程で不具合を見つけた場合は、修正せずに報告する

## 完了条件

- `npx vitest run app/pages/workout/__tests__/index.spec.ts` が通る
- `npm run test` と `npm run lint` が通る
