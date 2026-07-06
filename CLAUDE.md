# CLAUDE.md

エージェント共通ガイドの正本は AGENTS.md（以下を import）。

@AGENTS.md

## Claude 固有の補足

- Issue の詳細仕様・受け入れ条件・依存関係は `docs/issues/memo-app-issues.md`（Issue #1〜#14）を参照
- 環境変数 `SUPABASE_URL` / `SUPABASE_KEY` は `nuxt.config.ts` の
  `runtimeConfig.public.supabaseUrl` / `supabaseKey` として公開される（`.env.example` 参照）
- `useSupabase()` はモジュールスコープのシングルトン（SupabaseClient は Nuxt payload に
  シリアライズできないため `useState` 不使用）。環境変数未設定時は throw する
- `useWorkout` のカテゴリ絞り込みは全件取得後のクライアントフィルタ
  （メニュー候補算出のため全件を `allRecords` に別途保持）
