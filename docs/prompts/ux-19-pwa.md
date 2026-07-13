# PWA 化（ホーム画面インストール・最小限のオフライン対応）

以下の内容を実装してください。

## 背景

本アプリは単一ユーザーが毎日開くツールであり、ブラウザのブックマークよりホーム画面アイコンからの一発起動の方が習慣化に直結する。現状は `public/` ディレクトリが存在せず、`nuxt.config.ts` にも manifest / service worker の設定がなく、favicon もデフォルトのまま。iOS でもホーム画面追加時に Web アプリとして開ける環境が整っている。

## 変更内容

1. `@vite-pwa/nuxt` を導入し、`manifest`（アプリ名・テーマカラー・アイコン）を設定する
2. アプリアイコン（192px / 512px、maskable 含む）と favicon を `public/` に追加する。シンプルな図形＋文字程度の自作 SVG から生成してよい
3. Service Worker は静的アセットのキャッシュによる最小限のオフライン起動まで（Supabase データのオフライン編集・同期はスコープ外）
4. README.md にホーム画面追加の一文を追記する

## 対象範囲・制約

- 対象：`nuxt.config.ts`、`package.json`、`public/`、README.md
- オフラインでのデータ書き込み・同期キューは実装しない
- 依存追加は `@vite-pwa/nuxt`（とその peer）のみに留める

## 完了条件

- `npm run build` が通り、成果物に `manifest.webmanifest` と Service Worker が含まれる
- `npm run dev`（または `npm run build` ＋ preview）で起動し、ブラウザの DevTools で manifest が認識されることを確認する
- `npm run test` と `npm run lint` が通る
