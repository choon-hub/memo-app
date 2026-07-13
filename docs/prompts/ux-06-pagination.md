# 一覧のページネーション導入（DB 側ソート＋created_at インデックス）

以下の内容を実装してください。

## 背景

3つの composable の `fetchList` はいずれも `.select('*')` で件数制限なしの全件取得を行っており、データが増えるほど転送量・JSON パース・クライアント側ソートのコストが線形に増加する。また `supabase/migrations/0001_init.sql` では、ソートに使う `created_at` 列にインデックスがない。

## 変更内容

1. 各 composable の `fetchList` を `.order('created_at', { ascending: sortOrder === 'asc' }).range(from, to)` を使ったページ取得に変更する（1ページの件数は 20 件程度）
2. 一覧の末尾に「もっと見る」ボタンを置き、次ページを追記ロードする（無限スクロールは不要）
3. ソートは DB 側 `.order()` に移行する。`~/utils/sort` の `sortByDate` の利用箇所が残るか確認し、不要になればクライアント側ソートを削除する。`toggleSortOrder` はページ状態をリセットして1ページ目から再取得する
4. `created_at` にインデックスを追加するマイグレーションを作成する（**`supabase-migration` スキルを Skill ツールで呼び出して手順に従う**。3テーブルとも対象）
5. AGENTS.md の「並び替え・カテゴリ絞り込みはクライアント側で行う」という記述を実装に合わせて更新する

## 対象範囲・制約

- 対象：3つの composable、3ページと List コンポーネント（「もっと見る」導線）、マイグレーション新規ファイル、AGENTS.md、関連テスト
- 先に `ux-01`（workout の DB 側フィルタ）と `ux-02`（楽観的更新）を実施済みであることを前提とする。未実施ならその旨を報告して確認を取ってから進める
- `supabase gen types` の実行はコマンド提示に留める（supabase-migration スキルの方針どおり）

## 完了条件

- composable テストで「`.order()` / `.range()` が期待どおり呼ばれる」「もっと見るで次ページが追記される」ことを検証する
- `npm run test` と `npm run lint` が通る
