# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

個人用メモアプリ（単一ユーザー・認証なし）。3つの機能を持つ：
- **1日1新** (`/one-new`) — 毎日の新しい気づきをタイトル＋内容でメモ
- **日々のトピック** (`/topics`) — 今日あったことを内容のみでメモ
- **筋トレ** (`/workout`) — 胸/背中/脚のカテゴリ別にメニュー・強度・回数を記録

`/` は `routeRules` で `/one-new` にリダイレクトされる。

## Tech Stack

- **Nuxt 4** (Vue 3 / Composition API) — `srcDir: 'app/'`
- **TypeScript** — `strict: true`
- **Vitest** + `@nuxt/test-utils` + `@vue/test-utils` + `happy-dom`
- **Supabase** — DB のみ（Auth 未使用、RLS 未定）＋ `@supabase/supabase-js`
- **ESLint (flat config: `eslint.config.mjs`) + Prettier**

## Commands

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run test     # vitest run
npm run lint     # eslint . && prettier --check .
npm run format   # prettier --write .
```

単一テストファイルの実行：
```bash
npx vitest run app/composables/__tests__/useDailyNew.spec.ts
```

## Directory Structure

```
app/                          # srcDir（~ エイリアスはここを指す）
  assets/global.css           # 全ページ共通 CSS（nuxt.config.ts の css で読込）
  components/                 # 機能別 Form/List ＋ AppHeader / AppNavigation / WorkoutCategoryTabs 等
    __tests__/                # コンポーネントテスト
  composables/                # useDailyNew / useTopics / useWorkout / useSupabase
    __tests__/                # Composable のユニットテスト
  pages/
    one-new/index.vue         # 各ページ直下の __tests__/ にページテスト
    topics/index.vue
    workout/index.vue
  utils/                      # 純粋関数（date.ts / sort.ts / withLoading.ts）
  layouts/default.vue         # 共通レイアウト（ヘッダー＋ナビ＋slot）
  app.vue

shared/                       # 共通型（#shared/... で参照）
  types/
    database.ts               # supabase gen types で生成
    domain.ts                 # アプリドメイン型

supabase/
  migrations/
    0001_init.sql             # 全テーブル一括定義

test/
  mocks/
    supabase.ts               # Supabase クエリチェーンの共通モック
```

**エイリアス**:
- `~` → `app/`（例：`~/composables/useTopics`）
- `#shared/` → `shared/`（例：`#shared/types/domain`）

## Database Schema

**`daily_new`**: `id` (uuid PK), `title` (text), `content` (text), `created_at` (timestamptz)

**`topics`**: `id` (uuid PK), `content` (text), `created_at` (timestamptz)

**`workout_records`**: `id` (uuid PK), `category` (text, check in `'chest','back','legs'`), `menu` (text), `intensity` (numeric), `reps` (integer, > 0), `created_at` (timestamptz)

全カラム not null。`id` と `created_at` は DB デフォルトで自動設定。

## Architecture Patterns

### Supabase クライアント

`useSupabase()` がモジュールスコープのシングルトンでクライアントを保持する
（SupabaseClient は Nuxt payload にシリアライズできないため `useState` 不使用）。
環境変数未設定時は throw する。

### Composable 設計

3機能とも共通の状態（`items` / `loading` / `error` / `sortOrder`）を**モジュールスコープ**で共有する。
操作は機能ごとに異なる：

- `useDailyNew` — `fetchList` / `create` / `update` / `remove` / `toggleSortOrder`
- `useTopics` — `fetchList` / `create` / `update` / `toggleSortOrder`
- `useWorkout` — `fetchList(category?)` / `create` / `toggleSortOrder` / `menuSuggestions` / `getMenuCandidates`

共通の挙動：
- 並び替えは SQL の `.order()` ではなく、取得後に `~/utils/sort` の `sortByDate()` でクライアント側で行う
- `create()` は省略可能な `date` を受け取り、指定時は `created_at` を上書きする
- ローディング/エラー処理は `~/utils/withLoading` に共通化
- `useWorkout` のカテゴリ絞り込みは全件取得後のクライアントフィルタ
  （メニュー候補算出のため全件を `allRecords` に別途保持）

### コンポーネント分割

各機能につき `XxxForm.vue`（送信フォーム）と `XxxList.vue`（一覧表示）を分離し、
ページコンポーネント（`pages/xxx/index.vue`）で組み合わせる。筋トレのみ `WorkoutCategoryTabs.vue` が加わる。
初回データ取得はページの `useAsyncData` で行う。

### Import 規約

自作の composable / コンポーネント / utils は Nuxt の auto-import に頼らず明示的に import する。

### 型定義

- `WorkoutCategory = 'chest' | 'back' | 'legs'` — ユニオン型で型レベルのバリデーション
- ドメイン型（`DailyNew`, `Topic`, `WorkoutRecord`）は `#shared/types/domain` に集約
- DB 生成型は `#shared/types/database` に配置

## Environment Variables

```
SUPABASE_URL=...
SUPABASE_KEY=...  # anon key（public に置く前提。単一ユーザーのため）
```

`nuxt.config.ts` の `runtimeConfig.public.supabaseUrl` / `supabaseKey` として公開される。`.env.example` 参照。

## Testing Strategy

- **Composable テスト** (`app/composables/__tests__/`)：`vi.mock('~/composables/useSupabase')` で
  `test/mocks/supabase.ts` の `mockSupabaseClient` を返す。`beforeEach` で `resetMocks()` を呼び、
  モジュールスコープの state（`items` 等）も手動でリセットする
- **コンポーネントテスト** (`app/components/__tests__/`)：`@vue/test-utils` の `mount` でレンダリングと emit を検証
- **ページテスト** (`app/pages/*/__tests__/`)：Composable と `#app/composables/asyncData` を mock
- **SQL/マイグレーション**：Vitest 対象外。Supabase 上での手動検証

## Issue Tracking

開発の詳細仕様・受け入れ条件・依存関係は `memo-app-issues.md`（Issue #1〜#14）を参照。
