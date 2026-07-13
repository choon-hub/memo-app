# Google Fonts のセルフホスト化

以下の内容を実装してください。

## 背景

`nuxt.config.ts` で Google Fonts を CDN から読み込んでいる。`preconnect` 設定済みで大きな問題はないが、フォントファイルをプロジェクトに同梱すれば外部リクエストを1つ減らせ、オフライン時（将来の PWA 化を含む）にも表示が安定する。

## 変更内容

1. `nuxt.config.ts` で読み込んでいるフォント（family・weight）を確認する
2. 該当フォントの woff2 ファイルをプロジェクトに同梱し（`app/assets/fonts/` 等）、`@font-face` を `global.css` に定義する（`font-display: swap` を付ける）
3. `nuxt.config.ts` の Google Fonts への `link` と `preconnect` を削除する

## 対象範囲・制約

- 対象：`nuxt.config.ts`、`app/assets/`、`global.css`
- 使用している weight のみ同梱し、不要なウェイトは含めない
- フォント管理モジュール（`@nuxt/fonts` 等）の導入も選択肢だが、依存を増やさない手動同梱を優先する。判断に迷う場合は理由を添えて提案する

## 完了条件

- `npm run build` が通り、ビルド成果物に外部フォントへの参照が残っていない
- `npm run dev` で起動し、フォントが適用されていることを確認する
- `npm run test` と `npm run lint` が通る
