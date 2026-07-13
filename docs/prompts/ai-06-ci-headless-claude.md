# CI への headless Claude 組み込み（PR 自動レビュー）

以下の内容を実装してください。

## 背景

headless モードの Claude Code（`claude -p` または公式 GitHub Action）を CI に組み込むと、PR に対する自動レビューコメントを人手なしで回せる。個人開発のためコスト対効果の見極めが必要で、まずは最小構成（PR レビューのみ）から始める。

## 事前確認

実装前に以下をユーザーに確認する：

1. API キー（`ANTHROPIC_API_KEY`）を GitHub リポジトリの Secrets に登録できるか（従量課金が発生する）
2. 対象は「PR への自動レビューコメント」のみでよいか

## 変更内容

1. Anthropic 公式の GitHub Action（`anthropics/claude-code-action`）の現行の推奨セットアップを WebFetch / WebSearch で確認する（バージョン・必要な permissions・設定形式は変わりやすいため、必ず最新の公式ドキュメントに従う）
2. `.github/workflows/` に PR レビュー用ワークフローを追加する：
   - トリガー：`pull_request`（opened / synchronize）
   - 内容：diff をレビューし、正当性・要件への影響がある指摘のみをコメントする（スタイル指摘はしない）
   - 権限：ワークフローの `permissions` は必要最小限（`contents: read`、`pull-requests: write` 等）に絞る
3. 既存の test / lint ワークフローには手を入れない

## 対象範囲・制約

- 対象：`.github/workflows/` の新規ファイルのみ
- 「CI の失敗テストを自動修正する」ワークフローはスコープ外（まずレビューのみで運用し、効果を見てから）
- Secrets の登録はユーザーの作業のため、手順を提示する

## 完了条件

- ワークフローファイルが追加され、`npm run lint`（prettier チェック）が通る
- ユーザーが Secrets 登録後、テスト PR で動作することを確認する（確認手順を報告に含める）
