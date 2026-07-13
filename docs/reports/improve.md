## 優先度: 高

### 提案 1 — propose-feature の description を実態に合わせる

- **現状確認結果**: まだ該当。`~/.claude/skills/propose-feature/SKILL.md` の 3行目 description に「『機能提案して』『改善案出して』と言われたときに自動で適用する」とあり、4行目に `disable-model-invocation: true`。実際に本セッションの利用可能スキル一覧にも propose-feature と requirements-to-issues は現れておらず、「モデルから見えない」というレポートの記述は実挙動と一致。
- **差分方針**: 3行目の description を書き換える。「〜と言われたときに自動で適用する」を削除し、例えば「コードベースを分析し機能追加・改善を1つ提案し、承認後に GitHub Issue を作成する。`/propose-feature` で手動起動する」のように、`/` 起動前提であることを明記する。`disable-model-invocation: true` は維持。
- **依存・順序**: 提案 9（プロジェクトスキルへの移設）を先に決めるべき。移設するなら移設先のファイルに対して書き直す方が二度手間にならない。

### 提案 2 — propose-feature のデッドリンク削除・参照差し替え

- **現状確認結果**: まだ該当。66行目に「`.claude/skills/improve-codebase-architecture` を参照する」、72行目に「`.claude/skills/ce-brainstorm/SKILL.md` の…を参考に」があり、`~/.claude/skills/`（12スキルを実地確認）にも本プロジェクト（`.claude/` 配下は settings.json / settings.local.json のみで `skills/` ディレクトリ自体が不在）にも実体なし。123行目の「`.claude/skills/github-issues` の手順に従い」もパス直書きのまま。
- **差分方針**:
  - 66行目: 文ごと削除（Step 2 の調査テンプレート自体は自己完結しており、外部参照なしで成立する）。
  - 72行目: 「`.claude/skills/ce-brainstorm/SKILL.md` のブレインストーミング手法（…）を参考に」を「YAGNI・スコープ明確化・右サイズの成果物を意識して」のようにインライン化（括弧内の要点は既に本文にあるので参照は不要）。
  - 123行目: 「Skill ツールで `github-issues` を呼び出し、その手順に従い Issue を作成する」に変更。
- **依存・順序**: 提案 1 と同一ファイルなので同時に実施。提案 9 の移設判断が先。

### 提案 3 — github-issue-workflow の孤立 references/ 9ファイル整理

- **現状確認結果**: まだ該当。`references/` に 9ファイル・計 3,471 行が存在し、SKILL.md 本文に references/ へのリンクはゼロ。`phases-detailed.md` の冒頭を確認したところ、現在は `github-fetch-issue` サブスキルに分割済みの Phase 1（Issue 取得）手順がそのまま書かれており、「分割前の名残」というレポートの推定どおり。
- **差分方針**: 現行の SKILL.md はサブスキル委譲のみの薄いオーケストレータで、Phase の詳細・テストコマンド・セキュリティ手順はすべて各サブスキル側に実装済み。9ファイルは**全削除が妥当**（残す場合でも、`security-protocol.md`（98行）のような小さいものを SKILL.md から「何が書いてあり、いつ読むか」付きでリンクする形に限定）。ただし本タスクは読み取り専用のため、実施時に各ファイルの内容とサブスキル本文の重複を最終確認してから削除すること。
- **依存・順序**: 独立。いつでも実施可能。削除はファイル操作なのでユーザー確認のうえで。

### 提案 4 — workflow と implement-issue のトリガー分離

- **現状確認結果**: まだ該当。workflow の description は "resolve, implement, work on, fix, or close a GitHub issue"、implement-issue は "implement or resolve a specific GitHub Issue number"。両方とも `disable-model-invocation` なしでモデル呼び出し可（本セッションのスキル一覧に両方現れている）。「issue #5 を実装して」でどちらが選ばれるか不定という指摘は妥当。
- **差分方針**:
  - `github-implement-issue/SKILL.md` 3行目 description の末尾を「Normally invoked as a sub-step of `github-issue-workflow`. When invoked standalone it runs WITHOUT interactive confirmation gates.」のように書き換え、単独発火を抑制する。
  - workflow 側 description は現状の "end-to-end" 表現を維持しつつ、先頭に「ユーザーが Issue の実装を依頼したときの既定の入口（default entry point）」である旨を加える。
  - 本文 11–14 行目の「## When to Use」（implement-issue）と 28–34 行目（workflow）は提案 12 と合わせて削除。
- **依存・順序**: 独立。提案 12（When to Use 削除）と同一ファイルなので同時実施が効率的。

---

## 優先度: 中

### 提案 5 — `allowed-tools: Bash` の包括許可をスコープする

- **現状確認結果**: まだ該当。`github-implement-issue` と `github-commit-push` はともに `allowed-tools: Bash`（無条件）。**追加の発見**: `github-issue-workflow` の frontmatter は `allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task, AskUserQuestion, TodoWrite` で、本文 26行目の「This skill does not write code, run `git` commands, or call `gh` directly」という自己制約と矛盾している（Write/Edit/Bash を事前許可する必要がない）。また両オーケストレータとも `Skill` が allowed-tools に入っていない点もレポートどおり。
- **差分方針**:
  - `github-implement-issue`: `allowed-tools: Bash(gh issue view *), Bash(gh auth status), Skill`
  - `github-commit-push`: `allowed-tools: Bash(git *)`
  - `github-issue-workflow`: `allowed-tools: Skill` に縮小（本文の制約と一致させる）。Task / TodoWrite の除去は提案 8 と重なる。
- **依存・順序**: 提案 6・8 と同じ frontmatter 群を触るので、サブスキル4本＋オーケストレータ2本の frontmatter 一括改修として 5/6/8 をまとめて実施するのが効率的。

### 提案 6 — サブステップ4スキルに `user-invocable: false`

- **現状確認結果**: まだ該当。github-implement / github-test / github-review / github-commit-push の 4本とも `user-invocable` 未指定で、実際に本セッションのスキル一覧（＝`/` メニュー相当）に4本とも露出している。description にはいずれも "Use as a sub-step inside github-implement-issue" と明記済み。
- **差分方針**: 4ファイルの frontmatter に `user-invocable: false` を1行追加するだけ。
- **依存・順序**: 提案 5・8 と一括実施。

### 提案 7 — github-commit-push の `git add -A` 見直し

- **現状確認結果**: まだ該当。description（3行目）は "commits all **staged** changes" だが、本文 36行目は `git add -A`。
- **差分方針**: 2案のどちらかに統一。(a) description に合わせ `git add -A` を削除し「呼び出し元がステージ済みであること」を Inputs の前提条件に追加、(b) 実装に合わせ description を "commits all changes in the working tree" にしつつ、Step 2 の冒頭に `git status --short` で対象確認 → 意図しないファイル（.env 等）が含まれる場合は停止、というガードを追加。**推奨は (b)**：呼び出し元の github-implement はステージ操作をしておらず、(a) だと呼び出しチェーンが壊れるため。
- **依存・順序**: 提案 15（コミットタイプ追加）と同一ファイル。まとめて実施。

### 提案 8 — 旧ツール名（Task / TodoWrite）の更新

- **現状確認結果**: まだ該当。確認できた箇所は次のとおり。
  - `github-implement`: frontmatter の `TodoWrite, Task`（4行目）、本文 35行目の `Task(...)` 呼び出し例、63行目「Create a TodoWrite item」
  - `github-review`: frontmatter の `Task`（4行目）、28行目の `Task(...)`
  - `github-issue-workflow`: frontmatter の `Task, TodoWrite`（4行目）
  - 現行ハーネスのエージェント起動ツールは `Agent`、Todo 系は `TaskCreate` / `TaskUpdate` で、乖離はレポートどおり。
- **差分方針**: コード例の `Task(...)` は「Explore サブエージェントに調査を委譲する（Agent ツール、`subagent_type: "Explore"`）」のような意図ベースの記述＋最小限のパラメータ例に置き換え。「Create a TodoWrite item for each file change」は「計画の各ファイル変更をタスクとして追跡し、完了ごとに消し込む」に。frontmatter のツール名は提案 5 のスコープ見直しと同時に現行名へ。
- **依存・順序**: 提案 5・6 と一括実施。

### 提案 9 — プロジェクト固有内容をプロジェクトスキルへ移す

- **現状確認結果**: まだ該当。propose-feature の Step 1 質問 2 の選択肢（29–32行目）が「1日1新／日々のトピック／筋トレ」と memo-app 専用、Step 2 の調査テンプレートも `app/composables/` 等の memo-app 構成を直書き。requirements-to-issues も 55行目に `#shared/types/` が登場。本プロジェクトに `.claude/skills/` は存在しない（新規作成が必要）。
- **差分方針**: 2案。**(a) 推奨**: propose-feature を丸ごと本リポジトリ `.claude/skills/propose-feature/SKILL.md` へ移動（プロジェクト固有ワークフローとして扱う）し、グローバル側は削除。requirements-to-issues はグローバルに残し、55行目を「関連するデータ型・インターフェース（プロジェクトの共有型ディレクトリなど）」に汎用化。(b) propose-feature をグローバルに残し、Step 1 の機能メニューを「対象リポジトリの README / ルーティングから機能一覧を動的に把握して選択肢を組み立てる」方式に書き換え。
- **依存・順序**: **提案 1・2 より先に方針決定すること**（編集対象ファイルの場所が変わる）。提案 10 の案内文にも記載先が影響する。提案 11 とは requirements-to-issues を同時に編集できる。

### 提案 10 — AGENTS.md にスキル運用の案内を追加

- **現状確認結果**: まだ該当。CLAUDE.md / AGENTS.md ともにスキルへの言及が一切ない（両ファイル全文を確認）。`/propose-feature` と `/requirements-to-issues` は `disable-model-invocation: true` のためモデルからも見えず、起動経路がユーザーの記憶のみという指摘は正しい。
- **差分方針**: AGENTS.md の「## コミット / PR」の前後に「## スキル」節（3〜4行）を追加：「Issue 一括起票は `/requirements-to-issues`、機能提案は `/propose-feature`（いずれも手動起動専用・モデルからは不可視）、Issue の実装〜PR は `/github-issue-workflow`」。CLAUDE.md は @AGENTS.md import 方式なので変更不要。
- **依存・順序**: 提案 9（propose-feature の置き場所）と提案 4（workflow を既定の入口とする整理）が確定した後に書くのが望ましい。

### 提案 11 — requirements-to-issues Phase 4 を github-issues へ委譲

- **現状確認結果**: まだ該当。Phase 4（120–155行目）の `gh api repos/{owner}/{repo}/issues -X POST ...` は github-issues 本文（49–56行目）とほぼ同一。しかも github-issues 側は `-f type=` による issue type 指定を推奨しているのに対し、requirements-to-issues 側にはその記述がなく、既に挙動が割れ始めている（二重管理の弊害が現実化）。
- **差分方針**: Phase 4 の「リポジトリ情報の取得」「Issue 作成コマンド」のコードブロックを削除し、「Skill ツールで `github-issues` を呼び出し、Phase 3 のタスクごとに Issue を作成する。本文テンプレートは以下」に置き換える（本文テンプレートと完了報告フォーマットは requirements-to-issues 固有なので残す）。
- **依存・順序**: 提案 9 の requirements-to-issues 汎用化と同一ファイルなので同時実施。

---

## 優先度: 低

### 提案 12 — 本文「## When to Use」の frontmatter への集約

- **現状確認結果**: まだ該当。github-fetch-issue（11–14行目）、github-create-pr（11–14行目）、github-implement-issue（11–14行目）、github-issue-workflow（28–34行目）の4本に本文セクションが存在。いずれの内容も既に description とほぼ重複している。
- **差分方針**: 4ファイルから該当セクションを削除。description に載っていない情報（例: workflow の "User pastes a GitHub issue URL"）だけ description へ吸収する。
- **依存・順序**: 提案 4 と同一ファイルのため同時実施。

### 提案 13 — nuxt スキルを Nuxt 4 ベースで再生成

- **現状確認結果**: まだ該当。SKILL.md 12行目に「The skill is based on Nuxt 3.x, generated at 2026-01-28」と明記。本プロジェクトは Nuxt 4（AGENTS.md）で、srcDir=`app/` などの前提差異リスクはレポートどおり。スキルディレクトリに `GENERATION.md` があり再生成手順の手がかりになる。
- **差分方針**: 手編集ではなく antfu/skills のスクリプトで再生成（`GENERATION.md` の手順に従う）。references/ 一式が置き換わるため差し替え前後で `SKILL.md` の description が変わっていないか確認。
- **依存・順序**: 完全に独立。他と並行可。

### 提案 14 — docs/prompts/create-issues-prompt.md のアーカイブ

- **現状確認結果**: まだ該当。ファイルは現存し、「Claude Code に貼り付けて使う」旧方式・Issue #1〜#14 の一回性タスク前提・ラベル体系 `foundation`/`feature`/`test`（github-issues の issue type 優先方針と不整合）もレポートどおり。
- **差分方針**: 冒頭に「**アーカイブ済み（2026-07-07）**: 初期 Issue #1〜#14 の起票に使用済み。今後の一括起票は `/requirements-to-issues` を使うこと」の注記を追加。`docs/archive/` への移動でもよいが、本プロジェクトの docs 構成に archive/ はまだ無いので、注記追加のほうが差分が小さい。
- **依存・順序**: 独立。本リポジトリへのコミットになるので Conventional Commits（`docs:`）で。

### 提案 15 — github-commit-push のコミットタイプ拡充

- **現状確認結果**: まだ該当。github-commit-push の Inputs（14–16行目）とブランチ命名（27–30行目）は feature/fix/refactor・feat/fix/refactor のみ。**追加の発見**: タイプの導出元は `github-implement-issue` の Step 1（44–45行目、`bug`→fix / `enhancement`→feat / それ以外→refactor）なので、**github-commit-push 単体を直しても導出側が refactor に丸めてしまう**。両ファイルの修正が必要（レポートは commit-push 側のみ言及）。
- **差分方針**:
  - `github-implement-issue` 44–45行目: ラベル→タイプ対応に `documentation`→`docs`、`test`→`test`、その他雑務→`chore` を追加。
  - `github-commit-push` 14–16・27–30行目: Inputs とブランチ命名規則に `docs/` `test/` `chore/` を追加。
- **依存・順序**: 提案 7 と同一ファイル（commit-push）、提案 4 と同一ファイル（implement-issue）なので、それぞれの編集とまとめる。

### 提案 16 — github-fetch-issue の description を実装前用途に限定

- **現状確認結果**: まだ該当。description に "retrieve, view, or look up a GitHub Issue before implementing it" とあり、"view / look up" が github-issues のトリガー語と重複。末尾に "before implementing it" は既にあるため重複は「軽微」というレポートの評価も妥当。
- **差分方針**: description を「Fetches a GitHub Issue and captures a human-verified requirements summary **as the first step of implementation**. For simply viewing or querying issues, use `github-issues` instead.」の方向で書き換え、"view, or look up" を削除。
- **依存・順序**: 提案 12（同ファイルの When to Use 削除）と同時実施。

### 提案 17 — github-issues に `gh` フォールバックを追記

- **現状確認結果**: まだ該当。読み取り系は `mcp__github__*`（14–21行目）前提で、MCP サーバー未設定時のフォールバック記述なし。書き込み系は `gh api` で環境非依存。
- **差分方針**: 「### MCP Tools (read operations)」テーブル直後に1〜2行追加：「MCP サーバー未設定の環境では、読み取りも `gh issue view <N> --json ...` / `gh issue list` / `gh search issues` で代替する」。
- **依存・順序**: 独立。1行追記のみ。

### 提案 18 — eval 作成と `/doctor` 確認

- **現状確認結果**: まだ該当。`~/.claude/skills` 配下に eval 関連ファイルは存在しない（find で確認）。
- **差分方針**: skill-creator プラグインを導入し、トリガー衝突が問題になっている workflow / implement-issue / fetch-issue / github-issues の4本から eval を作成。「issue #5 を実装して」「issue #5 を見せて」等の発火テストケースで、提案 4・16 の修正前後の発火率を比較する。`/doctor` はユーザー操作が必要（モデルからは実行不可）。
- **依存・順序**: 厳密には「eval を先に作る」のが公式ベストプラクティスなので、**修正前にベースライン計測 → 提案 4・16 適用 → 再計測**の順が理想。最低限、提案 4・16 の後の検証としてでも価値あり。

---

## 実施順チェックリスト

編集対象ファイルの重なりを考慮し、優先度「高」を先頭に、同一ファイルの修正をバッチ化した順序です。

- [ ] **0. 方針決定（提案 9 の一部）**: propose-feature を本リポジトリ `.claude/skills/` へ移すか、グローバルのまま汎用化するかを決める（推奨: リポジトリへ移設）
- [ ] **1. propose-feature 改修（提案 1 + 2 + 9）**: 移設先で description 書き直し・デッドリンク2件削除・github-issues 参照を Skill ツール呼び出しに変更・機能メニューの扱い確定
- [ ] **2. github-issue-workflow の references/ 整理（提案 3）**: 9ファイルとサブスキル本文の重複を最終確認のうえ削除（または最小限リンク化）
- [ ] **3. トリガー分離＋When to Use 削除（提案 4 + 12 + 16）**: workflow / implement-issue / fetch-issue / create-pr の description 書き換えと本文セクション削除
- [ ] **4. frontmatter 一括改修（提案 5 + 6 + 8）**: allowed-tools のスコープ化（workflow は `Skill` のみに）、サブスキル4本へ `user-invocable: false`、Task/TodoWrite の現行名化・意図ベース化
- [ ] **5. github-commit-push 改修（提案 7 + 15）**: `git add -A` のガード追加（または staged 前提化）、コミットタイプに docs/test/chore 追加 — **implement-issue 側のタイプ導出（Step 1）も同時に修正**
- [ ] **6. requirements-to-issues 改修（提案 9 残り + 11)**: `#shared/types/` の汎用化、Phase 4 を github-issues への委譲に一本化
- [ ] **7. AGENTS.md にスキル案内追加（提案 10）**: 手順 1・3 の結果（スキルの置き場所・入口の整理）を反映して記載
- [ ] **8. create-issues-prompt.md のアーカイブ注記（提案 14）**: 本リポジトリに `docs:` コミット
- [ ] **9. github-issues に gh フォールバック追記（提案 17）**
- [ ] **10. nuxt スキル再生成（提案 13）**: GENERATION.md の手順で Nuxt 4 ベースに更新（独立作業・いつでも可）
- [ ] **11. eval 作成と /doctor 確認（提案 18）**: 手順 3 の修正効果を発火テストで検証（可能なら手順 3 の前にベースライン計測）

なお、手順 0〜1 の判断（propose-feature の置き場所）だけはユーザー決定が必要です。それ以外はレポートの提案どおりに機械的に進められる状態まで具体化できています。