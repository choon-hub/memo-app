# アクセシビリティ改善（フォーカス管理・装飾アイコンの aria-hidden）

以下の内容を実装してください。

## 背景

リポジトリ全体で `aria-` / `role=` / `tabindex` の使用箇所がゼロ。フォームの `label`/`for` 対応はできているが、編集モードに入っても編集用 input にフォーカスが移らず、装飾用 SVG アイコンをスクリーンリーダーが読み上げる可能性がある。

## 変更内容

1. 一覧コンポーネントで編集モードに入ったとき（`startEdit` 呼び出し時）、`nextTick` ＋ `ref` で編集用 input にオートフォーカスする（対象：`DailyNewList.vue`、`TopicList.vue` など編集機能を持つ一覧すべて）
2. 装飾用の SVG アイコン（`CalendarIcon.vue` 等）に `aria-hidden="true"` を付与する

## 対象範囲・制約

- エラー領域への `role="alert"` 付与は `ux-05-error-display.md` で対応するため、本プロンプトのスコープ外
- キーボードナビゲーションの全面的な設計変更はスコープ外。上記2点の最小対応に留める

## 完了条件

- コンポーネントテストで「編集開始後に編集用 input がフォーカスされている（`document.activeElement` 等で検証）」ことを確認する
- `npm run test` と `npm run lint` が通る
