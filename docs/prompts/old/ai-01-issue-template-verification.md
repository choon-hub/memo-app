# Issue テンプレートに「検証条件」セクションを追加する

以下の内容を実装してください。

## 背景

AI エージェントに Issue を実装させる際、受け入れ条件に加えて「エージェントが自分で実行できる pass/fail チェック」が Issue に書かれていると、それがそのまま実装の終了条件になり、検証の抜け漏れを防げる（Spec-Driven Development の実践）。`github-fetch-issue` → `github-implement` の既存ワークフローでも、検証条件がそのまま終了条件として機能する。現状 `.github/ISSUE_TEMPLATE/` には `bug_report.md` のみが存在し、検証条件のセクションがない。

## 変更内容

1. `.github/ISSUE_TEMPLATE/bug_report.md` に「## 検証条件」セクションを追加する。コメントで記入例を示す：
   - 例：「`npx vitest run app/composables/__tests__/useXxx.spec.ts` が通る」
   - 例：「`/workout` でカテゴリ切替後も入力値が保持される（コンポーネントテストで検証）」
2. 機能追加・改善用のテンプレート（`feature_request.md`）を新設する。構成は「概要 / 背景・目的 / 受け入れ条件 / 検証条件 / 補足」とし、既存 `bug_report.md` のトーン・書式（日本語、HTML コメントでの記入ガイド）を踏襲する
3. 検証条件セクションには「エージェントが実行して pass/fail を判定できる形で書く」旨のガイドコメントを入れる

## 対象範囲・制約

- 対象：`.github/ISSUE_TEMPLATE/` 配下のみ
- 既存 Issue の遡及修正、`docs/issues/` 配下のドキュメント修正はスコープ外

## 完了条件

- 2テンプレートに「検証条件」セクションと記入ガイドがあり、frontmatter（name / about / labels）が正しい
- `npm run lint`（prettier チェック）が通る
