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
npx vitest run app/composables/__tests__/useDailyNew.spec.ts   # 単一ファイル
```

変更後は `npm run test` と `npm run lint` を必ず通すこと。

## プロジェクト構成

- `app/` — Nuxt の srcDir。`~` エイリアスはここを指す
  - `components/` — 機能別の `XxxForm.vue` / `XxxList.vue` ＋ 共通 UI（AppHeader, AppNavigation, WorkoutCategoryTabs 等）
  - `composables/` — `useDailyNew` / `useTopics` / `useWorkout` / `useSupabase`
  - `pages/` — `one-new/` `topics/` `workout/` の各 `index.vue`
  - `utils/` — 純粋関数（`date.ts` / `sort.ts` / `withLoading.ts`）
  - `assets/global.css` — 全ページ共通 CSS
- `shared/types/` — `#shared/` エイリアスで参照する共通型（`domain.ts`、Supabase 生成型の `database.ts`）
- `supabase/migrations/` — スキーマ定義 SQL（Vitest 対象外・Supabase 上で手動検証）
- `test/mocks/supabase.ts` — Supabase クエリチェーンの共通モック
- テストは実装の近くに置く：`app/components/__tests__/`、`app/composables/__tests__/`、`app/pages/*/__tests__/`

## コード規約

- TypeScript strict。ドメイン型は `#shared/types/domain` に集約（`WorkoutCategory` はユニオン型）
- 自作の composable / コンポーネント / utils は auto-import に頼らず明示的に import する
- Prettier + ESLint（flat config: `eslint.config.mjs`）に従う
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
- 新機能・修正にはテストを追加すること

## データベース

テーブルは `supabase/migrations/0001_init.sql` に定義（`daily_new` / `topics` / `workout_records`）。
スキーマ変更時は新しいマイグレーションファイルを追加し、`shared/types/database.ts` を
`supabase gen types` で再生成する。

## コミット / PR

- Conventional Commits 形式（例：`feat: ...` / `fix: ...` / `refactor(composables): ...`）
- ブランチ名は `<type>/<issue番号>-<説明>`（例：`refactor/30-supabase-persistence`）
- main へは PR 経由でマージする
- Issue の詳細仕様は `docs/issues/memo-app-issues.md` を参照

## セキュリティ

- `.env` はコミットしない。`SUPABASE_KEY` は anon key（単一ユーザー前提で public 扱い）
- RLS は未設定のため、キーの扱いに注意
