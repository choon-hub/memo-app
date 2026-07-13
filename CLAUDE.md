# CLAUDE.md

エージェント共通ガイドの正本は AGENTS.md（以下を import）。

@AGENTS.md

## Claude 固有の補足

- `useSupabase()` はモジュールスコープのシングルトン（SupabaseClient は Nuxt payload に
  シリアライズできないため `useState` 不使用）。環境変数未設定時は throw する
- `useWorkout` のカテゴリ絞り込みは全件取得後のクライアントフィルタ
  （メニュー候補算出のため全件を `allRecords` に別途保持）
- compact 時は変更ファイル一覧・実行したテストコマンド・未解決の受け入れ条件を保持すること
