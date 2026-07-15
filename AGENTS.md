# AGENTS.md

AI コーディングエージェント向けのガイド。プロジェクトの人間向け説明は `README.md` を参照。

## プロジェクト概要

個人用メモアプリ（単一ユーザー・認証なし）。Nuxt 4 + TypeScript + Supabase（DB のみ、Auth 未使用）。

- **1日1新** (`/one-new`) — タイトル＋内容のメモ
- **日々のトピック** (`/topics`) — 内容のみのメモ
- **筋トレ** (`/workout`) — カテゴリ（chest/back/legs）別にメニュー・強度・回数を記録
- `/` は `/one-new` にリダイレクト

## セットアップ

```bash
npm install                # postinstall で nuxt prepare が走る（.nuxt/ 生成、型解決に必要）
cp .env.example .env       # SUPABASE_URL / SUPABASE_KEY を設定
npm run dev                # 開発サーバー
```

## コマンド

```bash
npm run test     # vitest run（全テスト）
npm run lint     # eslint . && prettier --check .
npm run format   # prettier --write .
npm run build    # プロダクションビルド
```

変更後は `npm run test` と `npm run lint` を必ず通すこと。

## プロジェクト構成

- `app/` — Nuxt の srcDir。`~` エイリアスはここを指す
  - `components/` — 機能別の `XxxForm.vue` / `XxxList.vue` ＋ 共通 UI（AppHeader, AppNavigation, WorkoutCategoryTabs 等）
  - `utils/` — 純粋関数（`date.ts` / `sort.ts` / `withLoading.ts`）
- `shared/types/` — `#shared/` エイリアスで参照する共通型（`domain.ts`、Supabase 生成型の `database.ts`）
- `supabase/migrations/` — スキーマ定義 SQL（Vitest 対象外・Supabase 上で手動検証）
- `test/mocks/supabase.ts` — Supabase クエリチェーンの共通モック
- テストは実装の近くに置く：`app/components/__tests__/`、`app/composables/__tests__/`、`app/pages/*/__tests__/`

## コード規約

- TypeScript strict。ドメイン型は `#shared/types/domain` に集約（`WorkoutCategory` はユニオン型）
- 自作の composable / コンポーネント / utils は auto-import に頼らず明示的に import する
- Composable のパターン：モジュールスコープで `items` / `loading` / `error` / `sortOrder` を共有し、
  `fetchList` / `create`（＋機能により `update` / `remove` / `toggleSortOrder`）を返す
- Supabase クライアントは `useSupabase()` のシングルトン経由でのみ取得する（直接 `createClient` しない）
- 並び替え・カテゴリ絞り込みはクライアント側（`~/utils/sort` の `sortByDate` 等）で行う
- ローディング/エラー処理は `~/utils/withLoading` を使う

## テスト方針

- Composable テスト：`vi.mock('~/composables/useSupabase')` で `test/mocks/supabase.ts` の
  `mockSupabaseClient` を返す。`beforeEach` で `resetMocks()` とモジュールスコープ state のリセットを行う
- コンポーネントテスト：`@vue/test-utils` の `mount` でレンダリングと emit を検証
- ページテスト：composable と `#app/composables/asyncData` を mock する

## データベース

テーブルは `supabase/migrations/0001_init.sql` に定義（`daily_new` / `topics` / `workout_records`）。
スキーマ変更時は新しいマイグレーションファイルを追加し、`shared/types/database.ts` を
`supabase gen types` で再生成する。

## スキル

グローバルスキル（`~/.claude/skills`）で以下のワークフローを提供している。

- Issue の一括起票は `/requirements-to-issues`、機能提案は `/propose-feature`（いずれも手動起動専用・モデルからは不可視）
- Issue の実装〜PR 作成は `github-issue-workflow` が既定の入口（「issue #N を実装して」等で発火。`/github-issue-workflow` でも手動起動可）

プロジェクトスキル（`.claude/skills`、本リポジトリ固有）：

- `supabase-migration` — マイグレーションファイルの追加（RLS 有効化を既定で検討）、型再生成コマンドの提示
- `add-memo-feature` — 一日1新／トピック／筋トレと同型の新規記録機能を composable・コンポーネント・ページ・テストまで一括生成

## コミット / PR

- Conventional Commits 形式（例：`feat: ...` / `fix: ...` / `refactor(composables): ...`）
- ブランチ名は `<type>/<issue番号>-<説明>`（例：`refactor/30-supabase-persistence`）
- main へは PR 経由でマージする
- Issue の詳細仕様は `docs/issues/memo-app-issues.md` を参照

## セキュリティ

- `.env` はコミットしない。`SUPABASE_KEY` は anon key（単一ユーザー前提で public 扱い）
- 全テーブルで RLS 有効（`0002_enable_rls_existing_tables.sql`）。ただし anon ロールに全操作を
  許可する permissive ポリシーのため、実効的なアクセス制限はない。キーの扱いには引き続き注意
