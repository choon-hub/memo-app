# CLAUDE.md

エージェント共通ガイドの正本は AGENTS.md（以下を import）。

@AGENTS.md

## Claude 固有の補足

- `useSupabase()` はモジュールスコープのシングルトン（SupabaseClient は Nuxt payload に
  シリアライズできないため `useState` 不使用）。環境変数未設定時は throw する
- `useWorkout` のカテゴリ絞り込みは DB 側クエリ（`.eq('category', ...)`）で行う。
  メニュー候補は `select('menu, category')` の軽量クエリ（`fetchMenuRecords`）で別途取得し
  `menuRecords` に保持（取得は初回表示時と `create` 成功時のみ）
- compact 時は変更ファイル一覧・実行したテストコマンド・未解決の受け入れ条件を保持すること
