# 新規導入 SKILL 提案・設計書

調査日: 2026-07-07 / 対象: 本リポジトリ (`memo-app`) 固有のプロジェクトスキル (`.claude/skills/`)

## 前提・スコープ

- `docs/reports/2026-07-07-skill-improve.md` / `docs/reports/improve.md` は**既存のグローバルスキル（github-\* 系・nuxt・propose-feature 等）の構造的不整合の是正案**であり、本ドキュメントとはスコープが異なる。本ドキュメントは **本プロジェクトにまだ存在しない、新規に作るべきスキル**の提案である。
- 現状、本リポジトリの `.claude/skills/` は空。汎用スキルはすべて `~/.claude/skills/`（全プロジェクト共通）にあり、memo-app 固有のワークフローを扱うスキルは存在しない。

## 調査結果: このプロジェクトで繰り返し発生する定型作業

`app/composables/useDailyNew.ts` / `useTopics.ts` / `useWorkout.ts` と、対応する `XxxForm.vue` / `XxxList.vue` / `pages/*/index.vue` / テストを比較すると、3機能は以下の型に強く従っている。

- composable: モジュールスコープの `items` / `loading` / `error` / `sortOrder` + `fetchList` / `create`（機能により `update` / `remove` / `toggleSortOrder`）
- コンポーネント: `XxxForm.vue`（入力・バリデーション）+ `XxxList.vue`（一覧・編集・削除）
- ページ: `useAsyncData` 経由での初期フェッチ
- テスト: `test/mocks/supabase.ts` の `mockSupabaseClient` / `resetMocks()` を使う composable テスト、`@vue/test-utils` の component テスト、asyncData をモックするページテスト

この対称性は **AGENTS.md の文書規約のみで担保**されており、コード生成側の支援がない。実際、`docs/reports/2026-07-06-architecture.md` は次の非対称・欠落を指摘済みである。

- #7 機能の非対称性（トピックに削除なし、筋トレに編集・削除なし）
- #11 コンポーネント間の props 不整合（`TopicList` の `loading` 必須/`DailyNewList` は optional、編集ボタンの `disabled` 有無）
- #13 テストの型・カバレッジ不備（`app/pages/workout/` にページテストが無い、`DailyNewList.spec.ts` が必須 prop 未指定で mount）

いずれも「新機能・変更を追加するたびに、規約を人力で守り切れていない」ことが根本原因であり、スキルによる雛形生成・チェックリスト化が効く典型パターン。

また AGENTS.md の「データベース」節には明文規定がある。

> スキーマ変更時は新しいマイグレーションファイルを追加し、`shared/types/database.ts` を `supabase gen types` で再生成する。

この手順の実行を保証する仕組みは無く、architecture report #1（**RLS 未設定 + anon key 公開**、優先度「高」）は「マイグレーション作成時に RLS 設定を検討する」ステップが手順化されていないために生じた典型的な抜け漏れである。

## 提案スキル

### Skill 1: `supabase-migration`（プロジェクトスキル）

**目的**: AGENTS.md の「新マイグレーション追加 → 型再生成」手順を漏れなく実行し、architecture report #1（RLS 未設定）の再発を防ぐ。

**Trigger 例**: 「テーブルを追加して」「カラムを追加して」「workout_records に sets カラムを足して」

**Steps**:
1. `supabase/migrations/` の最新連番を確認し、`0001_init.sql` の命名規則に従って次番号のファイルを採番する。
2. 要求に沿ったマイグレーション SQL を作成する。**テーブル新規作成時は `alter table ... enable row level security;` を既定で含める**（省略する場合はスキルがユーザーに理由を明示的に確認する一手間を挟む）。
3. 可能であれば `supabase db diff` 等で構文を検証する（CLI 未セットアップ環境では検証をスキップし、その旨を報告する）。
4. `supabase gen types typescript ...` の実行コマンドを提示する。**実行には Supabase プロジェクトの接続情報が要り、`shared/types/database.ts` の上書きを伴うため、コマンド提示までに留め、実行はユーザー確認後**とする。
5. 型変更が `shared/types/domain.ts` にも影響する場合は追記を促す。

**設計判断**:
- 本番 Supabase への接続・型再生成の実行そのものは行わず「コマンド提示 + ユーザー実行」に留める。認証情報を要し、生成物が既存ファイルを上書きする破壊的操作に近いため。
- RLS を既定でセットにするのは、architecture report で唯一「優先度: 高」とされたセキュリティ課題の再発防止が目的。個人用アプリという理由で省略する判断はスキルの外で構わないが、**一度は明示的に問う**ことで「気づかずに漏れる」ケースを防ぐ。

### Skill 2: `add-memo-feature`（プロジェクトスキル）

**目的**: one-new / topics / workout と同型の新しい CRUD メモ機能を追加する際、composable・Form/List コンポーネント・ページ・テストを規約通り一貫生成し、非対称性（report #7, #11）や テスト漏れ（#13）の再発を防ぐ。

**Trigger 例**: 「新しい記録機能を追加して」「読んだ本を記録する機能を作って」

**Inputs（ヒアリング項目）**:
- 機能名（日本語表示名 + kebab-case の識別子・テーブル名）
- フィールド定義（名前・型・必須/任意・バリデーション）
- カテゴリ絞り込みの要否（workout 的な機能か）
- 編集・削除・ソート反転の要否

**Steps**:
1. `shared/types/domain.ts` に型を追加する。
2. スキーマ変更は Skill 1（`supabase-migration`）に委譲する。
3. composable 雛形を生成する。テンプレートソースは `useDailyNew.ts`（編集・削除・ソート反転が揃っており最も完全な実装）とする。
4. `XxxForm.vue` / `XxxList.vue` を既存コンポーネントのマークアップ・CSS クラス・prop 命名パターン（`loading` は必須にする等、#11 の是正を反映）を踏襲して生成する。
5. `pages/<feature>/index.vue` を `useAsyncData` の既存パターンで生成する。
6. テスト雛形を生成する: composable テスト（`test/mocks/supabase.ts` の `resetMocks` パターン）、component テスト、ページテスト（既存はworkoutのみ欠落しているため、これを既定で含めることが#13の再発防止に直結する）。
7. `npm run test` / `npm run lint` を実行して確認する。
8. AGENTS.md「プロジェクト構成」への反映要否を確認する。

**設計判断・非目標**:
- 3 つの composable がほぼ同一実装である点（architecture report 改善提案1「`createCrudStore` ファクトリ化」）には踏み込まない。ファクトリ化はアーキテクチャ判断であり、スキルが先回りすべきではない。将来ファクトリが導入された場合はテンプレート側を追従させる。
- 生成物は「規約に沿った叩き台」までが責務。ビジネスロジックの完成度はスキルの範囲外。

## 導入しない／後回しにする候補と理由

| 候補 | 見送り理由 |
|---|---|
| 既存3機能の非対称性を検出する監査スキル | 一度きりの棚卸しであり継続的スキルとしての再利用価値が薄い。`add-memo-feature` 導入で「今後は非対称にならない」ことを担保し、既存分の是正は通常の Issue 化で対応する方が投資対効果が良い |
| フォーム/CSS 共通化スキル、日付フィールド共通化スキル | architecture report 改善提案 2/3 は一回性のリファクタ作業であり、繰り返し発生するワークフローではないためスキル化よりも1回の refactor PR が適切 |
| PWA化・エクスポート等の新機能提案スキル | 実装のワンショットタスクであり、`github-issue-workflow` 経由の通常実装で十分 |

## 導入順序の推奨

1. **`supabase-migration`** — 単純・他に依存しない。RLS 未設定という「優先度: 高」のリスクに直結するため先行させる価値が高い。
2. **`add-memo-feature`** — Skill 1 のスキーマ変更手順を前提として利用する。

## 関連する既存の宿題

`docs/reports/2026-07-07-skill-improve.md` / `docs/reports/improve.md` にまとめた既存グローバルスキルの構造的不整合（優先度「高」4件: propose-feature の description 矛盾・デッドリンク、github-issue-workflow の孤立 references、トリガー衝突）の解消は、本提案とは独立に並行して進めることを推奨する。
