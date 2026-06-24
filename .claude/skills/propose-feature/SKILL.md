---
name: propose-feature
description: コードベースを分析し機能追加または改善を提案する。承認後に GitHub Issue を作成する。「機能提案して」「改善案出して」と言われたときに自動で適用する。
disable-model-invocation: true
---

# Propose Feature

コードベース分析に基づき機能追加/改善を1つ提案し、ユーザー承認後に GitHub Issue を作成するワークフロースキル。

**重要:** Step 4 でユーザーの承認を得るまで Issue を作成しない。

## Step 1 — 要求の明確化

`ToolSearch` で `select:AskUserQuestion` を呼び出してスキーマをロードしてから、`AskUserQuestion` ツールで以下を確認する。

**質問 1: 提案の種類**

```
options:
  - 機能追加（新しい機能を加える）
  - 機能改善（既存機能をより良くする）
```

**質問 2: 対象機能**

```
options:
  - 1日1新（/one-new）
  - 日々のトピック（/topics）
  - 筋トレ（/workout）
  - アプリ全体（共通UI・ナビ・パフォーマンスなど）
```

**質問 3: 解決したい課題・達成したいゴール**（オープンエンド）

> 「どんな課題を解決したい、またはどんな状態にしたいですか？」

一度に1つの質問を投げ、回答を受け取ってから次へ進む。

---

## Step 2 — コードベース探索（サブエージェントに委任）

メインコンテキストを汚さないため `Agent` ツールを使いサブエージェントに調査を委任する。

**サブエージェントへの指示例:**

```
以下を調査し、サマリーのみを返してください（ファイル全文は含めない）。

対象機能: <Step 1 で確認した機能>

調査項目:
1. 対象機能の composable（app/composables/）の公開インターフェース（関数名・引数・戻り値）
2. 対応する pages/（app/pages/）と components/（app/components/）の構成
3. 関連する DB スキーマ（shared/types/domain.ts、supabase/migrations/）
4. 既存の状態管理パターン（loading/error の持ち方）

返答フォーマット:
- 主要ファイルのパス一覧
- composable の公開インターフェース（箇条書き）
- アーキテクチャ上の注目点（既存パターンとの整合性）
```

アーキテクチャの語彙や設計原則は `.claude/skills/improve-codebase-architecture` を参照する。

---

## Step 3 — 提案の生成

`.claude/skills/ce-brainstorm/SKILL.md` のブレインストーミング手法（YAGNI・スコープ明確化・右サイズの成果物）を参考に、以下の構造で提案を1つ作成する。

```markdown
## 提案: <タイトル>

### What（提案内容）
<何を作るか・何を変えるかを1〜3文で>

### Why（解決する課題）
<Step 1 で確認した課題・ゴールとの対応>

### How（実装概要）
影響ファイル:
- `app/composables/useXxx.ts` — <変更内容の概要>
- `app/pages/xxx/index.vue` — <変更内容の概要>
- `app/components/XxxForm.vue` — <変更内容の概要>
（DB変更を伴う場合は `supabase/migrations/` も記載）

### スコープ外
- <意図的に対象としないこと>

### 受け入れ条件
- [ ] <条件1>
- [ ] <条件2>
- [ ] （テスト）<テスト観点>
```

提案は1つに絞る。複数案を並べない。

---

## Step 4 — ユーザー承認

`AskUserQuestion` ツールで Step 3 の提案を提示し確認する。

```
question: "この提案で GitHub Issue を作成してよいですか？"
options:
  - このまま承認する
  - 修正してから承認（修正内容を教えてください）
  - 却下
```

- **「このまま承認」** → Step 5 へ進む
- **「修正してから承認」** → 修正内容を受け取り提案を更新して Step 4 を再度実施する
- **「却下」** → ここで終了する（Issue は作成しない）

---

## Step 5 — GitHub Issue 作成

`.claude/skills/github-issues` の手順に従い Issue を作成する。

**Issue 本文のテンプレート:**

```markdown
## 概要
<Step 3 の What を転記>

## 背景・課題
<Step 3 の Why を転記>

## 実装メモ
影響ファイル:
<Step 3 の How のファイル一覧を転記>

## 受け入れ条件
<Step 3 のチェックリストを転記>
```

**ラベル:** `enhancement`（機能追加）または `improvement`（機能改善）を付与する。

Issue 作成後、URL をユーザーに伝えて終了する。

---

## 制約

- Step 4 の承認なしに Issue を作成しない
- コードベース探索は必ずサブエージェント（`Agent` ツール）に委任する
- 提案は1つに絞り、スコープ外を明示する
- ファイルパスはリポジトリルートからの相対パスで記載する（絶対パス禁止）
