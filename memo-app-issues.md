# メモアプリ GitHub Issue 一覧（Nuxt 4）

> 個人用メモアプリ（単一ユーザー前提・認証なし）の開発 Issue。
> Claude Code がそのまま着手できる粒度で記述。

## 技術スタック

- Nuxt 4（Vue 3 / Composition API）※ `app/` ディレクトリ構成
- TypeScript（strict）
- Vitest（ユニットテスト）
- Supabase（DB のみ。Auth は使わない）
- デザイン実装は Claude Design

## Nuxt 4 ディレクトリ規約（重要）

Nuxt 4 では `srcDir` がデフォルトで `app/` になる。各 Issue のパスはこの規約に従う。

```
app/
  components/      ← コンポーネント
  composables/     ← Composable
  pages/           ← ページ
  layouts/         ← レイアウト
  app.vue
shared/
  types/           ← アプリ/サーバー共通の型
server/            ← （今回は未使用）
supabase/
  migrations/      ← マイグレーション SQL
test/              ← 共通テストユーティリティ
nuxt.config.ts
vitest.config.ts
```

`~` エイリアスは `app/` を指す（`~/composables/...` → `app/composables/...`）。`shared/` 配下は `#shared/...` で参照する。

---

## Issue 一覧

| 番号 | タイトル | 種別 | 依存Issue |
|------|---------|------|-----------|
| #1 | Nuxt 4 プロジェクト初期化と開発環境セットアップ | 基盤 | なし |
| #2 | Supabase クライアント接続のセットアップ | 基盤 | #1 |
| #3 | 共通レイアウトとナビゲーション実装 | 基盤 | #1 |
| #4 | DBスキーマ設計・マイグレーション（全テーブル） | 基盤 | #2 |
| #5 | 共通型定義の整備（Database 型・ドメイン型） | 基盤 | #4 |
| #6 | 「1日1新」Composable（一覧取得・作成） | 機能 | #4, #5 |
| #7 | 「1日1新」画面実装（一覧・作成フォーム） | 機能 | #6, #3 |
| #8 | 「1日1新」Composable のユニットテスト | テスト | #6 |
| #9 | 「日々のトピック」Composable（一覧取得・作成） | 機能 | #4, #5 |
| #10 | 「日々のトピック」画面実装（一覧・作成フォーム） | 機能 | #9, #3 |
| #11 | 「日々のトピック」Composable のユニットテスト | テスト | #9 |
| #12 | 「筋トレ」Composable（カテゴリ別記録の取得・作成） | 機能 | #4, #5 |
| #13 | 「筋トレ」画面実装（カテゴリ切替・記録フォーム） | 機能 | #12, #3 |
| #14 | 「筋トレ」Composable のユニットテスト | テスト | #12 |

---

## [#1] Nuxt 4 プロジェクト初期化と開発環境セットアップ

### 背景 / 目的
全機能の土台となる Nuxt 4 プロジェクトを用意する。後続のすべての Issue がこのセットアップを前提とする。Nuxt 4 の `app/` ディレクトリ構成を採用する。

### やること
- [ ] Nuxt 4（Vue 3 / Composition API）プロジェクトを初期化（`app/` ディレクトリ構成）
- [ ] TypeScript を有効化（`strict: true`）
- [ ] `app.vue` を `app/app.vue` に配置
- [ ] Vitest と `@nuxt/test-utils`、`@vue/test-utils`、`happy-dom`（または `jsdom`）を導入し、`vitest.config.ts` を整備
- [ ] ESLint / Prettier を導入（任意だが推奨）
- [ ] `.env` および `.env.example` の雛形を用意
- [ ] `package.json` に `dev` / `build` / `test` スクリプトを定義

### 受け入れ条件（AC）
- [ ] `npm run dev` でアプリが起動し、`app/app.vue` の内容が表示される
- [ ] `npm run test` で Vitest が起動し、サンプルテスト（`1 + 1 === 2` 等）が通る
- [ ] 型チェック（`nuxt typecheck` 相当）がエラーなく通る

### 対象ファイル / ディレクトリ案
- `nuxt.config.ts`（新規）
- `vitest.config.ts`（新規）
- `tsconfig.json`（新規）
- `package.json`（新規）
- `app/app.vue`（新規）
- `.env.example`（新規）

### テスト方針（Vitest）
- 環境が正しく動くことの確認用にサンプルテストを1件用意する
- 代表ケース：自明なアサーション1件（環境疎通確認）
- モック対象：なし

### 依存
なし

---

## [#2] Supabase クライアント接続のセットアップ

### 背景 / 目的
DB として Supabase を利用する（Auth は使わない）。全機能で共有する Supabase クライアントを初期化し、環境変数経由で接続できるようにする。

### やること
- [ ] `@supabase/supabase-js` を導入
- [ ] `SUPABASE_URL` / `SUPABASE_KEY` を `runtimeConfig`（`public`）経由で読み込む設定を `nuxt.config.ts` に追加
- [ ] Supabase クライアントを返す Composable または plugin を作成
- [ ] `.env.example` に必要な環境変数を追記

### 受け入れ条件（AC）
- [ ] Composable / plugin 経由で Supabase クライアントインスタンスを取得できる
- [ ] 環境変数が未設定の場合に分かりやすいエラー（または警告）が出る
- [ ] 接続確認用の簡易クエリ（任意テーブルへの `select`）がローカルで成功する

### 対象ファイル / ディレクトリ案
- `app/composables/useSupabase.ts`（新規） または `app/plugins/supabase.ts`（新規）
- `nuxt.config.ts`（変更：`runtimeConfig` 追加）
- `.env.example`（変更）

### テスト方針（Vitest）
- 対象：`useSupabase`（クライアント生成ロジック）
- 代表ケース：正常系＝クライアントが生成される / 異常系＝環境変数欠如時にエラーを投げる
- モック対象：`createClient`（`@supabase/supabase-js`）を `vi.mock` でスタブ化

### 依存
#1

> **要決定**：anon key を public に置く前提（単一ユーザー・自分専用のため）。RLS を有効化するか無効のまま運用するかは本人判断とし、本 Issue ではスキーマ側（#4）で別途検討する。

---

## [#3] 共通レイアウトとナビゲーション実装

### 背景 / 目的
3機能（1日1新 / 日々のトピック / 筋トレ）をナビゲーションで切り替える。全画面共通の枠とナビを先に用意する。

### やること
- [ ] `app/layouts/default.vue` を作成し、ヘッダー＋ナビ＋`<slot />` 構成にする
- [ ] 3機能へのナビゲーションリンク（`NuxtLink`）を設置
- [ ] 各機能のルーティング用の空ページを用意（プレースホルダ）
- [ ] アクティブなナビ項目を視覚的に区別できるようにする
- [ ] デザイン実装は Claude Design の出力を反映

### 受け入れ条件（AC）
- [ ] ナビの各リンクをクリックすると対応するルートに遷移する
- [ ] 現在表示中の機能に対応するナビ項目がアクティブ表示される
- [ ] 全機能ページで共通レイアウトが適用される

### 対象ファイル / ディレクトリ案
- `app/layouts/default.vue`（新規）
- `app/components/AppNavigation.vue`（新規）
- `app/pages/one-new/index.vue`（新規・プレースホルダ）
- `app/pages/topics/index.vue`（新規・プレースホルダ）
- `app/pages/workout/index.vue`（新規・プレースホルダ）

### テスト方針（Vitest）
- 対象：`AppNavigation.vue`
- 代表ケース：3つのリンクがレンダリングされる / 各リンクの `to` が正しいパスを指す
- モック対象：`NuxtLink`（必要に応じて stub）

### 依存
#1

> **要決定**：ルートパス（`/` 直下）にどの機能を割り当てるか、または機能選択トップを置くか。

---

## [#4] DBスキーマ設計・マイグレーション（全テーブル）

### 背景 / 目的
3機能のデータ永続化先テーブルをまとめて定義する。後続の全 Composable がこのスキーマに依存する。

### やること
- [ ] 以下3テーブルの `CREATE TABLE` マイグレーションを作成
- [ ] `supabase/migrations/` に SQL を配置
- [ ] ローカル（または Supabase プロジェクト）へ適用

**テーブル定義**

`daily_new`（1日1新）

| カラム | 型 | 制約 |
|--------|----|----|
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `title` | `text` | `not null` |
| `content` | `text` | `not null` |
| `created_at` | `timestamptz` | `not null default now()` |

`topics`（日々のトピック）

| カラム | 型 | 制約 |
|--------|----|----|
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `content` | `text` | `not null` |
| `created_at` | `timestamptz` | `not null default now()` |

`workout_records`（筋トレ）

| カラム | 型 | 制約 |
|--------|----|----|
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `category` | `text` | `not null`, `check (category in ('chest','back','legs'))` |
| `menu` | `text` | `not null` |
| `intensity` | `numeric` | `not null`（強度：重量等） |
| `reps` | `integer` | `not null check (reps > 0)` |
| `created_at` | `timestamptz` | `not null default now()` |

### 受け入れ条件（AC）
- [ ] マイグレーション適用後、3テーブルが存在する
- [ ] `category` に許可値以外を挿入すると check 制約で失敗する
- [ ] `reps <= 0` の挿入が失敗する
- [ ] 各テーブルへの `insert` / `select` が成功する

### 対象ファイル / ディレクトリ案
- `supabase/migrations/0001_init.sql`（新規）

### テスト方針（Vitest）
- 本 Issue は SQL のため Vitest 対象外。検証は Supabase 上での手動 insert / select で行う

### 依存
#2

> **要決定**：①強度（`intensity`）の単位・型を「重量(kg)」と「自重」で分けるか、単一 `numeric` で運用するか。②筋トレで「セット数」を持つか（現仕様は「メニュー・強度・回数をセットで記録」とのみ記載のため、複数セット対応の要否は未確定）。③RLS の有効/無効。④論理削除カラムの要否。

---

## [#5] 共通型定義の整備（Database 型・ドメイン型）

### 背景 / 目的
TypeScript で型安全に Supabase を扱うため、テーブルに対応する型を整備する。全 Composable / 画面が参照する。Nuxt 4 では共通型を `shared/` 配下に置き `#shared/...` で参照する。

### やること
- [ ] `supabase gen types typescript` で生成した Database 型を配置（または手書き）
- [ ] アプリ内で使うドメイン型（`DailyNew`, `Topic`, `WorkoutRecord`, `WorkoutCategory` 等）を定義
- [ ] `WorkoutCategory` を `'chest' | 'back' | 'legs'` のユニオン型で定義

### 受け入れ条件（AC）
- [ ] 各テーブルの行型がアプリから import して利用できる
- [ ] `category` が許可値のみを取るユニオン型として型推論される
- [ ] 型チェックがエラーなく通る

### 対象ファイル / ディレクトリ案
- `shared/types/database.ts`（新規・生成物）
- `shared/types/domain.ts`（新規）

### テスト方針（Vitest）
- 型のみのため実行テストは不要。必要なら型レベルテスト（`expectTypeOf`）を1件

### 依存
#4

---

## [#6] 「1日1新」Composable（一覧取得・作成）

### 背景 / 目的
「1日1新」機能のデータ操作（一覧取得・新規作成）をロジックとして切り出し、画面とテストから再利用できるようにする。

### やること
- [ ] `useDailyNew` Composable を作成
- [ ] `fetchList()`：`daily_new` を取得して返す
- [ ] `create({ title, content })`：1件 insert する
- [ ] ローディング / エラー状態を保持する

### 受け入れ条件（AC）
- [ ] `fetchList()` で `daily_new` の行配列が取得できる
- [ ] `create()` で1件追加され、追加後の一覧に反映できる
- [ ] Supabase エラー時に error 状態が設定される

### 対象ファイル / ディレクトリ案
- `app/composables/useDailyNew.ts`（新規）

### テスト方針（Vitest）
- 対象：`useDailyNew`
- 代表ケース：正常系＝取得/作成成功 / 異常系＝Supabase が error を返す / 境界値＝空配列取得
- モック対象：Supabase クライアント（`from().select()` / `from().insert()` チェーンを `vi.fn` でスタブ）

### 依存
#4, #5

> **要決定**：一覧の並び順（`created_at` 降順を想定するが仕様未記載）。

---

## [#7] 「1日1新」画面実装（一覧・作成フォーム）

### 背景 / 目的
毎日新しいことをタイトル＋内容（1〜2行）でメモする画面を実装する。

### やること
- [ ] `app/pages/one-new/index.vue` を実装（一覧表示＋作成フォーム）
- [ ] タイトル入力（1行）／内容入力（1〜2行のテキストエリア）
- [ ] `useDailyNew` を用いて一覧取得・作成を行う
- [ ] 作成成功後に一覧を更新
- [ ] デザインは Claude Design の出力を反映

### 受け入れ条件（AC）
- [ ] フォーム送信で1件保存され、一覧に即時反映される
- [ ] タイトル・内容が未入力の場合は送信できない（バリデーション）
- [ ] 一覧に各メモのタイトル・内容・作成日時が表示される

### 対象ファイル / ディレクトリ案
- `app/pages/one-new/index.vue`（変更：プレースホルダ→本実装）
- `app/components/DailyNewForm.vue`（新規）
- `app/components/DailyNewList.vue`（新規）

### テスト方針（Vitest）
- 対象：`DailyNewForm.vue` / `DailyNewList.vue`
- 代表ケース：未入力時に送信ボタンが無効 / 入力時に emit が発火 / リストが行数分レンダリングされる
- モック対象：`useDailyNew`

### 依存
#6, #3

---

## [#8] 「1日1新」Composable のユニットテスト

### 背景 / 目的
`useDailyNew` の取得・作成ロジックを Vitest で保証する。

### やること
- [ ] `useDailyNew` の正常系・異常系テストを作成
- [ ] Supabase クライアントのモックユーティリティを整備（他機能でも再利用可能に）

### 受け入れ条件（AC）
- [ ] `fetchList` / `create` の正常系・異常系テストが通る
- [ ] `npm run test` で全テストがパスする

### 対象ファイル / ディレクトリ案
- `app/composables/__tests__/useDailyNew.spec.ts`（新規）
- `test/mocks/supabase.ts`（新規・共通モック）

### テスト方針（Vitest）
- 代表ケース：取得成功（複数件・0件）／作成成功／insert エラー時の error 設定
- モック対象：Supabase クライアント

### 依存
#6

---

## [#9] 「日々のトピック」Composable（一覧取得・作成）

### 背景 / 目的
「日々のトピック」機能のデータ操作（内容のみ）をロジック化する。

### やること
- [ ] `useTopics` Composable を作成
- [ ] `fetchList()`：`topics` を取得
- [ ] `create({ content })`：1件 insert
- [ ] ローディング / エラー状態を保持

### 受け入れ条件（AC）
- [ ] `fetchList()` で `topics` の行配列が取得できる
- [ ] `create()` で1件追加できる
- [ ] エラー時に error 状態が設定される

### 対象ファイル / ディレクトリ案
- `app/composables/useTopics.ts`（新規）

### テスト方針（Vitest）
- 対象：`useTopics`
- 代表ケース：正常系＝取得/作成 / 異常系＝error / 境界値＝空配列
- モック対象：Supabase クライアント

### 依存
#4, #5

> **要決定**：一覧の並び順（`created_at` 降順想定だが未記載）。

---

## [#10] 「日々のトピック」画面実装（一覧・作成フォーム）

### 背景 / 目的
今日あったことを内容のみでメモする画面を実装する。

### やること
- [ ] `app/pages/topics/index.vue` を実装（一覧＋作成フォーム）
- [ ] 内容入力（テキストエリア）のみ
- [ ] `useTopics` で取得・作成
- [ ] 作成成功後に一覧更新
- [ ] デザインは Claude Design の出力を反映

### 受け入れ条件（AC）
- [ ] フォーム送信で1件保存され、一覧に即時反映される
- [ ] 内容未入力では送信できない
- [ ] 一覧に各トピックの内容・作成日時が表示される

### 対象ファイル / ディレクトリ案
- `app/pages/topics/index.vue`（変更：プレースホルダ→本実装）
- `app/components/TopicForm.vue`（新規）
- `app/components/TopicList.vue`（新規）

### テスト方針（Vitest）
- 対象：`TopicForm.vue` / `TopicList.vue`
- 代表ケース：未入力時に送信無効 / 入力時に emit / リストが行数分レンダリング
- モック対象：`useTopics`

### 依存
#9, #3

---

## [#11] 「日々のトピック」Composable のユニットテスト

### 背景 / 目的
`useTopics` の取得・作成ロジックを Vitest で保証する。

### やること
- [ ] `useTopics` の正常系・異常系テストを作成
- [ ] #8 で整備した Supabase モックを再利用

### 受け入れ条件（AC）
- [ ] `fetchList` / `create` の正常系・異常系テストが通る
- [ ] `npm run test` で全テストがパスする

### 対象ファイル / ディレクトリ案
- `app/composables/__tests__/useTopics.spec.ts`（新規）

### テスト方針（Vitest）
- 代表ケース：取得成功（複数・0件）／作成成功／insert エラー
- モック対象：Supabase クライアント（`test/mocks/supabase.ts`）

### 依存
#9

---

## [#12] 「筋トレ」Composable（カテゴリ別記録の取得・作成）

### 背景 / 目的
胸 / 背中 / 脚のカテゴリ別に、メニュー・強度・回数を記録する機能のロジックを切り出す。

### やること
- [ ] `useWorkout` Composable を作成
- [ ] `fetchList(category?)`：`workout_records` を取得（カテゴリ指定で絞り込み可）
- [ ] `create({ category, menu, intensity, reps })`：1件 insert
- [ ] `category` は `WorkoutCategory` 型で受ける
- [ ] ローディング / エラー状態を保持

### 受け入れ条件（AC）
- [ ] `fetchList('chest')` で胸カテゴリのみ取得できる
- [ ] `create()` で1件追加できる
- [ ] 不正カテゴリは型レベルで弾かれる
- [ ] エラー時に error 状態が設定される

### 対象ファイル / ディレクトリ案
- `app/composables/useWorkout.ts`（新規）

### テスト方針（Vitest）
- 対象：`useWorkout`
- 代表ケース：正常系＝カテゴリ絞り込み取得/作成 / 異常系＝error / 境界値＝該当0件
- モック対象：Supabase クライアント（`from().select().eq()` / `insert()` チェーン）

### 依存
#4, #5

> **要決定**：①並び順（`created_at` 降順想定だが未記載）。②複数セット記録の要否（#4 の要決定と連動）。

---

## [#13] 「筋トレ」画面実装（カテゴリ切替・記録フォーム）

### 背景 / 目的
胸 / 背中 / 脚を切り替えながら、メニュー・強度・回数を記録・閲覧する画面を実装する。

### やること
- [ ] `app/pages/workout/index.vue` を実装
- [ ] カテゴリ切替 UI（胸 / 背中 / 脚）
- [ ] 記録フォーム（メニュー：text / 強度：number / 回数：number）
- [ ] `useWorkout` で選択カテゴリの取得・作成
- [ ] 作成成功後に一覧更新
- [ ] デザインは Claude Design の出力を反映

### 受け入れ条件（AC）
- [ ] カテゴリ切替で該当カテゴリの記録のみ表示される
- [ ] フォーム送信で選択中カテゴリに1件保存され、一覧に反映される
- [ ] メニュー・強度・回数が未入力／不正値の場合は送信できない（回数は正の整数）

### 対象ファイル / ディレクトリ案
- `app/pages/workout/index.vue`（変更：プレースホルダ→本実装）
- `app/components/WorkoutCategoryTabs.vue`（新規）
- `app/components/WorkoutForm.vue`（新規）
- `app/components/WorkoutList.vue`（新規）

### テスト方針（Vitest）
- 対象：`WorkoutCategoryTabs.vue` / `WorkoutForm.vue` / `WorkoutList.vue`
- 代表ケース：タブ切替で emit / 不正値で送信無効 / リストが行数分レンダリング
- モック対象：`useWorkout`

### 依存
#12, #3

---

## [#14] 「筋トレ」Composable のユニットテスト

### 背景 / 目的
`useWorkout` のカテゴリ別取得・作成ロジックを Vitest で保証する。

### やること
- [ ] `useWorkout` の正常系・異常系テストを作成
- [ ] カテゴリ絞り込みの検証を含める
- [ ] #8 の Supabase モックを再利用

### 受け入れ条件（AC）
- [ ] `fetchList(category)` のカテゴリ絞り込みテストが通る
- [ ] `create` の正常系・異常系テストが通る
- [ ] `npm run test` で全テストがパスする

### 対象ファイル / ディレクトリ案
- `app/composables/__tests__/useWorkout.spec.ts`（新規）

### テスト方針（Vitest）
- 代表ケース：カテゴリ指定取得（該当あり/0件）／作成成功／insert エラー
- モック対象：Supabase クライアント（`eq` フィルタ含む）

### 依存
#12
