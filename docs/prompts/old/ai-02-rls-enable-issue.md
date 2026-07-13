# 既存3テーブルの RLS 有効化を Issue として起票する

以下の内容を実行してください（このプロンプトは Issue の起票まで。実装は起票した Issue を通じて別途行う）。

## 背景

AGENTS.md に「RLS は未設定のため、キーの扱いに注意」と明記されており、anon key を public 扱いする前提では本番公開時のリスクになる。プロジェクトスキル `supabase-migration` は新規テーブルで RLS 有効化を既定で検討する方針になっているが、既存3テーブル（`daily_new` / `topics` / `workout_records`）は未対応のまま残っている。

## 手順

1. `docs/issues/deploy-02-supabase-production.md` を読み、RLS 有効化がすでに含まれているか確認する
   - 含まれている場合：単独 Issue にするか deploy-02 に統合するかをユーザーに確認する
   - 含まれていない場合：単独 Issue として起票する
2. Issue 本文には以下を含める：
   - 背景（anon key 公開前提・単一ユーザー運用でも RLS が最後の防壁になること）
   - 作業内容：既存3テーブルに `alter table ... enable row level security;` と適切なポリシーを追加するマイグレーションの作成（`supabase-migration` スキルの手順に従う）。単一ユーザー・Auth 未使用の前提でどのようなポリシーにするか（anon ロールへの許可方針）は Issue 内で明記する
   - 検証条件：マイグレーション適用後もアプリの既存機能（3ページの取得・作成・編集・削除）が動作すること、`npm run test` が通ること
3. Skill ツールで `github-issues` を呼び出し、その手順に従って起票する（ラベル・issue type の扱いも同スキルに従う）

## 制約

- このプロンプトではマイグレーションの実装・適用は行わない（起票まで）
- `.env` 等のシークレットは読まない
