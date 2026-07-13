# 権限プロンプトの棚卸し（allowlist の最適化）

以下の内容を実行してください。

## 背景

承認クリックの形骸化を防ぐには、既知の安全なコマンドを allowlist 化して確認プロンプト自体を減らすのが有効。`.claude/settings.json` には恒久 allow の基盤がすでにあるため、過去の許可履歴から追加候補を洗い出すだけでよい。

## 手順

1. Skill ツールで `fewer-permission-prompts` を呼び出し、過去のトランスクリプトから頻出する読み取り専用コマンドの allowlist 候補を生成する
2. 提案された候補を既存の `.claude/settings.json` の allow 設定と突き合わせ、重複を除いた追加分を提示する
3. 内容（特に書き込みを伴い得るコマンドが紛れていないか）を確認したうえで `.claude/settings.json` に反映する

## 制約

- 追加するのは読み取り専用・冪等なコマンドに限る。書き込み系（`git push`、`rm`、`gh api -X POST` 等）は allowlist に入れない
- 既存の `.env` 保護 hook・deny 設定は変更しない

## 完了条件

- 追加した permission の一覧と、それぞれを安全と判断した理由を報告する
