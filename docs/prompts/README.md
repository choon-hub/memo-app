# 改善プロンプト集

`docs/reports/` の改善レポートを、Claude に1件ずつ実行させられる粒度のプロンプトに分割したもの。

## 使い方

```
docs/prompts/ux-01-workout-query-optimization.md の内容を実行してください
```

各ファイルは「背景（Why）／変更内容／対象範囲・制約／完了条件」で構成されており、1ファイル＝1つの機能改善・追加・指示に対応する。

## 生成元と対象範囲

- `ux-*`：`docs/reports/2026-07-08-ux-performance-review.md` 由来（全項目。関連項目は統合）
- `ai-*`：`docs/reports/2026-07-09-ai-driven-development-best-practices.md` 由来（実行可能な提案のみ。提案2は実施済み、提案4は都度の運用判断のため対象外）
- `2026-07-07-skill-improve.md` / `improve.md` / `2026-07-07-new-skill-proposal.md` の提案は**すべて実施済み**（2026-07-09 確認）のため対象外

## UX・パフォーマンス改善（優先度順）

| ファイル | 優先度 | 内容 | 元レポート項目 |
| --- | --- | --- | --- |
| `ux-01-workout-query-optimization.md` | 高 | 筋トレの DB 側カテゴリフィルタ＋候補用軽量クエリ | 2.2 / 2.4 / 2.6 |
| `ux-02-optimistic-updates.md` | 高 | 作成・更新・削除後の全件再フェッチを楽観的更新に | 2.3 |
| `ux-03-delete-confirmation.md` | 高 | 削除操作に確認ステップを追加 | 1.3 |
| `ux-04-loading-indicator.md` | 中 | 一覧のローディング表示（スピナー） | 1.1 |
| `ux-05-error-display.md` | 中 | エラー表示改善（role="alert"・再試行・閉じる） | 1.2 |
| `ux-06-pagination.md` | 中 | ページネーション＋created_at インデックス | 2.1 / 3.3 |
| `ux-07-responsive-layout.md` | 中 | PC 幅の間延び解消（max-width 中央寄せ） | 1.6 |
| `ux-08-streak-heatmap.md` | 中 | ストリーク表示・カレンダーヒートマップ | 4.1 |
| `ux-09-workout-page-tests.md` | 中 | 筋トレページのページテスト追加 | 3.1 |
| `ux-10-dark-mode.md` | 低 | ダークモード対応（色トークン変数化） | 1.5 |
| `ux-11-accessibility.md` | 低 | 編集時オートフォーカス・aria-hidden | 1.4 |
| `ux-12-topics-delete.md` | 低 | トピックに削除機能を追加（要仕様確認） | 1.8 |
| `ux-13-menu-suggestions-order.md` | 低 | メニュー候補チップを直近使用順に | 1.9 |
| `ux-14-validation-messages.md` | 低 | フォームのインラインバリデーション表示 | 1.7 |
| `ux-15-bodyweight-display.md` | 低 | 自重種目の「0kg」表記を「自重」に | 3.4 |
| `ux-16-usestate-migration.md` | 低 | モジュールスコープ state の useState 移行 | 2.5 |
| `ux-17-font-selfhost.md` | 低 | Google Fonts のセルフホスト化 | 2.7 |
| `ux-18-workout-progress-chart.md` | 検討 | 種目別推移グラフ・自己ベスト表示 | 4.2 |
| `ux-19-pwa.md` | 検討 | PWA 化（ホーム画面・最小オフライン） | 4.3 / 3.2 |
| `ux-20-data-export.md` | 検討 | JSON/CSV エクスポート | 4.4 |
| `ux-21-monthly-summary.md` | 検討 | 月次振り返りサマリー（ux-08 実施後） | 4.5 |

## AI 駆動開発の改善

| ファイル | 内容 | 元レポート提案 |
| --- | --- | --- |
| `ai-01-issue-template-verification.md` | Issue テンプレートに「検証条件」を必須化 | 提案1 |
| `ai-02-rls-enable-issue.md` | 既存3テーブルの RLS 有効化を Issue 起票 | 提案5 |
| `ai-03-claude-md-pruning.md` | CLAUDE.md / AGENTS.md の剪定＋compaction 指示 | 提案6 |
| `ai-04-permission-audit.md` | 権限プロンプトの棚卸し（allowlist 最適化） | 提案7 |
| `ai-05-app-driven-verification.md` | UI 変更時の実アプリ駆動検証を明文化 | 提案3 |
| `ai-06-ci-headless-claude.md` | CI への headless Claude 組み込み（PR レビュー） | 提案8 |

## 依存関係の注意

- `ux-01` → `ux-13`（同じ関数を触るため ux-01 が先）
- `ux-01` / `ux-02` → `ux-06`（ページネーションは両者の実施を前提）
- `ux-03` → `ux-12`（削除確認のパターンを踏襲）
- `ux-08` → `ux-21`（サマリーはヒートマップの拡張）
- `ux-16` は影響範囲が広いため単独ブランチで実施する

---

`create-issues-prompt.md` は初期 Issue 起票に使用済みの旧方式プロンプト（アーカイブ）。
