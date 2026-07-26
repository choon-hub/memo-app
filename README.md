# memo-app

個人用メモアプリ（単一ユーザー・認証なし）。Nuxt 4 + TypeScript + Supabase（DB のみ）。

- **1日1新** (`/one-new`) — タイトル＋内容のメモ
- **日々のトピック** (`/topics`) — 内容のみのメモ
- **筋トレ** (`/workout`) — カテゴリ（chest/back/legs）別にメニュー・強度・回数を記録

セットアップやコマンドは [AGENTS.md](./AGENTS.md) を参照。

## デプロイ

**公開 URL**: `https://<project-name>.vercel.app`（実際のプロジェクト名に置き換え）

Vercel（Hobby プラン・無料）にデプロイしている。Nuxt 4 はゼロコンフィグでデプロイでき、
GitHub 連携により main ブランチへの push のたびに自動デプロイされる。

### デプロイ手順

1. [Vercel](https://vercel.com) にログインし、GitHub リポジトリを接続してプロジェクトを作成
   （Framework Preset: Nuxt を選択、他はデフォルトのままで可）
2. Vercel プロジェクトの Settings → Environment Variables に以下を設定
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
3. main ブランチへ push すると自動的にビルド・デプロイされる

### 環境変数の管理

`SUPABASE_URL` / `SUPABASE_KEY` は **Vercel ダッシュボードでのみ管理**する。
`.env` はリポジトリにコミットしない（ローカル開発用は `.env.example` を参照して各自作成する）。

### Hobby プランの制約

- **非商用・個人利用限定**（規約上、広告掲載や課金導入は違反になる）
- 無料枠: 帯域 100GB/月、Edge リクエスト 100万/月、Function 100万回/月
- 無料枠の上限を超過すると、従量課金オプションがないため該当機能が次サイクル（30日後）まで停止する
