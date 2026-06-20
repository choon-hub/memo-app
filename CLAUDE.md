# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

個人用メモアプリ（単一ユーザー・認証なし）。3つの機能を持つ：
- **1日1新** (`/one-new`) — 毎日の新しい気づきをタイトル＋内容でメモ
- **日々のトピック** (`/topics`) — 今日あったことを内容のみでメモ
- **筋トレ** (`/workout`) — 胸/背中/脚のカテゴリ別にメニュー・強度・回数を記録

## Tech Stack

- **Nuxt 4** (Vue 3 / Composition API) — `app/` ディレクトリ構成（srcDir デフォルト）
- **TypeScript** — `strict: true`
- **Vitest** + `@nuxt/test-utils` + `@vue/test-utils` + `happy-dom`
- **Supabase** — DB のみ（Auth 未使用、RLS 未定）
- **@supabase/supabase-js**

## Commands

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run test     # Vitest 実行
npm run lint     # ESLint / Prettier（任意）
```

単一テストファイルの実行：
```bash
npx vitest run app/composables/__tests__/useDailyNew.spec.ts
```

## Directory Structure

```
app/                          # srcDir（~ エイリアスはここを指す）
  components/                 # Vue コンポーネント
  composables/                # Composable（ビジネスロジック）
    __tests__/                # Composable のユニットテスト
  pages/
    one-new/index.vue
    topics/index.vue
    workout/index.vue
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
    supabase.ts               # Supabase クライアントの共通モック

nuxt.config.ts
vitest.config.ts
tsconfig.json
.env / .env.example
```

**エイリアス**:
- `~` → `app/`（例：`~/composables/useTopics`）
- `#shared/` → `shared/`（例：`#shared/types/domain`）

## Database Schema

**`daily_new`**: `id` (uuid PK), `title` (text), `content` (text), `created_at` (timestamptz)

**`topics`**: `id` (uuid PK), `content` (text), `created_at` (timestamptz)

**`workout_records`**: `id` (uuid PK), `category` (text, check in `'chest','back','legs'`), `menu` (text), `intensity` (numeric), `reps` (integer, > 0), `created_at` (timestamptz)

## Architecture Patterns

### Composable 設計

各機能は `fetchList()` / `create()` + ローディング/エラー状態を持つ Composable に分離する：

```ts
// 例：useDailyNew, useTopics, useWorkout の共通パターン
const items = ref<T[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchList() { ... }
async function create(payload) { ... }
```

`useWorkout` のみ `fetchList(category?: WorkoutCategory)` でカテゴリ絞り込みをサポートする。

### コンポーネント分割

各機能につき `XxxForm.vue`（送信フォーム）と `XxxList.vue`（一覧表示）を分離し、ページコンポーネント（`pages/xxx/index.vue`）で組み合わせる。

### 型定義

- `WorkoutCategory = 'chest' | 'back' | 'legs'` — ユニオン型で型レベルのバリデーション
- ドメイン型（`DailyNew`, `Topic`, `WorkoutRecord`）は `#shared/types/domain` に集約
- DB 生成型は `#shared/types/database` に配置

## Environment Variables

```
SUPABASE_URL=...
SUPABASE_KEY=...  # anon key（public に置く前提。単一ユーザーのため）
```

`nuxt.config.ts` の `runtimeConfig.public` 経由で読み込む。

## Testing Strategy

- **Composable テスト**: `test/mocks/supabase.ts` の共通モックを `vi.mock` で使い回す
- **コンポーネントテスト**: Composable を mock し、レンダリングと emit を検証
- **SQL/マイグレーション**: Vitest 対象外。Supabase 上での手動検証

テストファイルは `app/composables/__tests__/*.spec.ts` に配置。

## Issue Tracking

開発の詳細仕様・受け入れ条件・依存関係は `memo-app-issues.md` を参照（Issue #1〜#14）。実装順の依存関係：`#1 → #2/#3 → #4 → #5 → #6/#9/#12 → 各UI/テスト`。
