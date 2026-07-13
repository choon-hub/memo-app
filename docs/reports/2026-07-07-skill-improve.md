# Claude Code SKILL 運用の改善点レポート（2026-07-07）

対象:

- **グローバルスキル定義**: `~/.claude/skills/*/SKILL.md`（全12スキル）
- **本プロジェクトのスキル運用**: `CLAUDE.md` / `AGENTS.md` / `docs/prompts/create-issues-prompt.md`

調査は読み取り専用で実施。SKILL.md 等への変更は行っていない。

---

## 1. 参考にしたベストプラクティス

### 一次情報（公式）

- **Claude Code 公式ドキュメント「Extend Claude with skills」**
  https://code.claude.com/docs/en/skills
  - `allowed-tools` は「許可の事前付与（プロンプトなしで使える）」であり、**ツールを制限する機能ではない**。制限したい場合は `disallowed-tools` を使う
  - `disable-model-invocation: true` を付けると **description がモデルのコンテキストに載らず、Skill ツール経由の呼び出しも不可**になる（ユーザーの `/name` 起動のみ）
  - `user-invocable: false` は逆に「モデルのみ呼び出し可・`/` メニューから非表示」。サブステップ用スキルの整理に使える
  - `description` + `when_to_use` はスキル一覧上で **合計 1,536 文字で切り詰め**られる。キーとなるユースケースを先頭に書く
  - スキル一覧のコンテキスト予算はモデルのコンテキストウィンドウの約1%。スキルが多いと description が短縮・脱落する（`/doctor` で確認可能）
  - **補助ファイル（references/ 等）は SKILL.md から明示的にリンクする**こと。「何が書いてあり、いつ読むべきか」を SKILL.md 側に書かないと Claude はロードしない
  - SKILL.md は **500行以内**を目安に。超えるなら references/ に分割
  - 一度ロードされたスキル本文はセッション中コンテキストに残り続けるため、本文の1行1行が継続的なトークンコストになる
  - `` !`command` `` による動的コンテキスト注入、`context: fork` + `agent` によるサブエージェント実行がサポートされる
- **Anthropic 公式「Skill authoring best practices」**
  https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
  - `description` は **三人称**で「何をするか＋いつ使うか」を書く（最大1,024文字）。トリガーとなる具体的キーワードを含める
  - 「Claude はすでに賢い」前提で、Claude が知っていることの説明は削る（簡潔さ最優先）
  - 参照ファイルは **SKILL.md から1階層まで**（参照の参照はロード漏れの原因）。100行超の参照ファイルには冒頭に目次を置く
  - 時間経過で陳腐化する情報（特定日付・バージョン分岐等）を本文に書かない
  - タスクの壊れやすさに応じて自由度を調整する（壊れやすい操作ほど具体的なコマンドで固定する）
  - MCP ツールは `ServerName:tool_name` の完全修飾名で書く
  - スキルは **評価（eval）を先に作って**から書く。skill-creator プラグインで発火率・出力品質を計測できる

### 二次情報（参考）

- Agent Skills オープン標準: https://agentskills.io
- skill-creator プラグイン: https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator

---

## 2. スキルごとの課題・問題点

### 2.1 propose-feature（重大な問題が集中）

1. **description と `disable-model-invocation: true` が矛盾**
   description に「『機能提案して』『改善案出して』と言われたときに自動で適用する」とあるが、`disable-model-invocation: true` のため **description はモデルに一切見えず、自動適用は構造的に不可能**。実際、本セッションでもモデルの利用可能スキル一覧に propose-feature は現れない。ユーザーが `/propose-feature` と打つ以外に起動手段はない。
2. **存在しないスキルへの参照（デッドリンク）が2件**
   - Step 2:「`.claude/skills/improve-codebase-architecture` を参照する」
   - Step 3:「`.claude/skills/ce-brainstorm/SKILL.md` のブレインストーミング手法…を参考に」
     いずれも `~/.claude/skills/` にも本プロジェクトの `.claude/skills/`（存在しない）にも実体がない。実行時に Claude が探して失敗するか、無言でスキップされる。
3. **github-issues への参照パスが旧構成のまま**
   Step 5:「`.claude/skills/github-issues` の手順に従い」— 実体は `~/.claude/skills/github-issues` に移設済み。パス直書きではなく「Skill ツールで `github-issues` を呼び出す」と書くべき（場所に依存しない）。
4. **グローバルスキルなのに memo-app 固有の内容**
   Step 1 の選択肢が「1日1新（/one-new）／日々のトピック（/topics）／筋トレ（/workout）」と本プロジェクト専用。`~/.claude/skills` は全プロジェクトに適用されるため、他プロジェクトで起動すると誤った選択肢を提示する。プロジェクト固有手順は本来リポジトリ内 `.claude/skills/`（プロジェクトスキル）に置くのが公式の使い分け。

### 2.2 github-issue-workflow

1. **references/ 配下の9ファイルが SKILL.md から一切参照されていない（孤立）**
   `best-practices.md` `commit-examples.md` `constraints-warnings.md` `examples.md` `phase-workflows.md` `phases-detailed.md` `prerequisites.md` `security-protocol.md` `test-commands.md` が存在するが、SKILL.md 本文にリンクがない。公式ガイドは「補助ファイルは SKILL.md から参照して初めてロードされる」と明記しており、現状これらは**決して読まれないデッドウェイト**（旧構成＝分割前の名残とみられる）。
2. **github-implement-issue と description のトリガーが衝突**
   両者とも "implement issue #N" "resolve issue" "fix issue #N" 系で発火する記述。どちらもモデル呼び出し可のため、ユーザーが「issue #5 を実装して」と言ったとき、確認ゲートありの workflow と確認なしの implement-issue の**どちらが選ばれるか不定**。
3. **「git/gh を直接実行しない」等の制約が散文のみ**
   構造的に強制したいなら `disallowed-tools` が使える（公式ドキュメントに明記）。現状は指示違反を防ぐ仕組みがない。

### 2.3 github-implement-issue

1. **`allowed-tools: Bash` は「制限」として機能していない**
   公式仕様では `allowed-tools` は許可の事前付与であり、他ツールも引き続き使用可能。「Bash だけに絞る」意図なら誤解。さらに `Bash` 無条件指定は**任意のシェルコマンドを確認なしで実行できる**包括許可であり、公式例のように `Bash(gh *)` 等へスコープすべき。また本文はサブスキルを Skill ツールで呼ぶ設計なので、事前許可するなら本来 `Skill` も対象。
2. **トリガー衝突**（2.2-2 と同件）。

### 2.4 サブステップ4スキル（github-implement / github-test / github-review / github-commit-push）

1. **`/` メニューに露出している**
   description に「Use as a sub-step inside github-implement-issue」とある通りユーザーが単独起動する想定がないのに、`user-invocable` 未指定（デフォルト true）のため `/` メニューに並ぶ。公式の使い分けでは、こうした「モデル（オーケストレータ）専用」スキルは `user-invocable: false` が適切。
2. **github-commit-push: description と実装の不一致**
   description は "commits all **staged** changes" だが、本文は `git add -A` で**未ステージ・未追跡ファイルも全て**巻き込む。意図しないファイルのコミット・プッシュにつながるリスク。`allowed-tools: Bash` も包括的すぎる（`Bash(git *)` にスコープ可能）。
3. **github-implement / github-review: 旧ツール名を直書き**
   本文の `Task(...)` はエージェント起動ツールの旧名（現行ハーネスでは `Agent`）。github-implement の `allowed-tools` の `Task` / `TodoWrite` も同様に現行名と乖離（TodoWrite → TaskCreate/TaskUpdate 系）。ツール名のピン留めはハーネス更新で陳腐化する（公式の「時間依存情報を書かない」原則に抵触）。「Explore サブエージェントに委譲する」のような**意図ベースの記述**が頑健。
4. **github-commit-push: コミットタイプが feat/fix/refactor のみ**
   プロジェクト規約（CLAUDE.md / AGENTS.md）は docs / test / chore も定義しており、これらのラベルを持つ Issue で表現できない。

### 2.5 github-issues

1. **MCP ツール前提が環境依存**
   読み取り系を `mcp__github__*`（@modelcontextprotocol/server-github）前提で記述。当該 MCP サーバーが未設定の環境ではそのまま失敗する。書き込み系は `gh api` なので動くが、読み取りにも `gh` フォールバックを一言添えると頑健。
2. **ラベル運用が本プロジェクトと不整合**（3.2 参照）。
   ※ description の書き方（what + when + 具体的トリガー語の列挙）と references/ の分割・リンクは公式ベストプラクティスに最も忠実で、**他スキルの手本になる品質**。

### 2.6 requirements-to-issues

1. **Issue 作成ロジックが github-issues と重複**
   Phase 4 の `gh api repos/.../issues -X POST ...` は github-issues 本文とほぼ同一のコマンドを再掲している。二重管理になっており、片方だけ更新されると挙動が割れる。propose-feature は github-issues に委譲しているので、委譲方式に統一するのが整合的。
2. **プロジェクト固有の記述を含むグローバルスキル**
   調査観点に `#shared/types/` など memo-app 固有のエイリアスが登場（propose-feature ほど重篤ではないが同種の問題）。
3. `argument-hint` / `$ARGUMENTS` / 1問1答の設計は公式パターンに沿っており良好。

### 2.7 github-fetch-issue / github-create-pr

1. **本文の「## When to Use」セクションは発見に寄与しない**
   スキル本文は起動後にしかロードされないため、トリガー情報は frontmatter（description / `when_to_use`）に置くのが正しい。本文側の同セクションは起動後の恒常トークンコストにしかならない（github-implement-issue / github-issue-workflow も同様）。
2. **github-fetch-issue と github-issues のトリガー重複（軽微）**
   "view / look up a GitHub Issue" が両方の description にあり、単に Issue を見たいだけの依頼で実装前提の fetch-issue（確認ゲート付き）が発火し得る。
3. github-create-pr は `` !`git diff` `` 等の**動的コンテキスト注入**を使うと Step 1–2 の手動コマンド実行を省ける（任意の最適化）。

### 2.8 nuxt

1. **Nuxt 3.x ベースだが本プロジェクトは Nuxt 4**
   本文に「The skill is based on Nuxt 3.x, generated at 2026-01-28」と明記。srcDir 既定値（`app/`）など Nuxt 4 で変わった点について古い情報を提示するリスクがある。antfu/skills のスクリプトで再生成可能。
   ※ 構造自体（概要＋トピック別 references テーブル、1階層リンク）は公式の progressive disclosure パターンの模範例。

### 2.9 全スキル共通

- 12スキル＋バンドルスキルで description の合計がコンテキスト予算（約1%）を圧迫し得る。`/doctor` で短縮・脱落の有無を確認しておくとよい
- eval が存在しない。skill-creator の評価ループ（発火率・出力品質のベースライン比較）は未導入

---

## 3. 本プロジェクトでの運用の課題

### 3.1 CLAUDE.md / AGENTS.md がスキル運用に一切言及していない

- `/requirements-to-issues` と `/propose-feature` は `disable-model-invocation: true` のため**モデルからは存在自体が見えない**。ドキュメントにも書かれていないため、ユーザー本人の記憶だけが起動経路になっている。AGENTS.md（または docs/）に「Issue 起票は `/requirements-to-issues`、機能提案は `/propose-feature`、Issue 実装は `/github-issue-workflow`」のような1〜3行の案内があるとチーム・将来の自分・他エージェントに共有できる。
- AGENTS.md の規約（ブランチ名 `<type>/<issue番号>-<説明>`、変更後に `npm run test` と `npm run lint`）は github-commit-push / github-test の動作と概ね整合しており、この点は良好。

### 3.2 docs/prompts/create-issues-prompt.md が旧方式のまま残存

- 「Claude Code に貼り付けて使う」一括 Issue 作成プロンプトで、機能的に requirements-to-issues / github-issues と重複する
- Issue #1〜#14 の初期起票という**一回性のタスク**に紐づいており、役目は終わっている可能性が高い
- ラベル体系（`foundation` / `feature` / `test`）が github-issues の推奨（issue type 優先、`bug` / `enhancement` 等）と不整合。今後これを再利用すると運用が割れる

### 3.3 プロジェクトスキル（.claude/skills/）の不在による置き場所の歪み

汎用スキルを `~/.claude/skills` へ集約した方針自体は正しいが、その際に**プロジェクト固有の内容（propose-feature の機能メニュー等）まで一緒にグローバルへ移った**のが 2.1-4 / 2.6-2 の原因。「汎用＝グローバル、プロジェクト固有＝リポジトリ内 `.claude/skills/`」という公式の使い分けに沿って再配置する余地がある。

---

## 4. 改善提案（優先度付き）

### 優先度: 高（誤動作・デッドコードの解消）

| # | 提案 | 対応する課題 |
|---|------|-------------|
| 1 | **propose-feature の description を実態に合わせて書き直す**。「自動で適用する」を削除し、`/propose-feature` での手動起動前提の記述にする（`disable-model-invocation` は妥当なので維持） | 2.1-1 |
| 2 | **propose-feature のデッドリンク2件を削除または実在する参照へ差し替え**（improve-codebase-architecture / ce-brainstorm）。github-issues への参照はパス直書きをやめ「Skill ツールで `github-issues` を呼ぶ」に変更 | 2.1-2, 2.1-3 |
| 3 | **github-issue-workflow の孤立 references/ 9ファイルを整理**。現在の運用に必要なものだけ SKILL.md からリンクし（「何が書いてあり、いつ読むか」を添える）、不要なら削除 | 2.2-1 |
| 4 | **github-issue-workflow と github-implement-issue のトリガーを分離**。例: workflow 側を「対話的に・end-to-end で」に限定し、implement-issue 側の description に「通常は github-issue-workflow から呼ばれるサブステップ。単独では確認なしで実行される」と明記する | 2.2-2, 2.3-2 |

### 優先度: 中（安全性・保守性の向上）

| # | 提案 | 対応する課題 |
|---|------|-------------|
| 5 | **`allowed-tools: Bash` の包括許可をスコープする**。github-implement-issue / github-commit-push は `Bash(git *)` `Bash(gh *)` 等に限定し、オーケストレータには `Skill` を追加。「制限」が意図なら `disallowed-tools` を併用 | 2.3-1, 2.4-2 |
| 6 | **サブステップ4スキル（github-implement / test / review / commit-push）に `user-invocable: false` を付与**し `/` メニューから隠す（モデル＝オーケストレータからは引き続き呼べる） | 2.4-1 |
| 7 | **github-commit-push の `git add -A` を見直す**。description（staged changes）に合わせてステージ済みのみコミットするか、`git status` 確認ステップを挟んで意図しないファイルの混入を防ぐ | 2.4-2 |
| 8 | **旧ツール名（Task / TodoWrite）を現行名に更新するか、意図ベースの記述に置き換える**（例:「Explore サブエージェントに調査を委譲する」） | 2.4-3 |
| 9 | **propose-feature のプロジェクト固有部分をリポジトリ内 `.claude/skills/` のプロジェクトスキルへ移す**（または機能一覧を動的に取得する汎用形に書き換える）。requirements-to-issues の `#shared/types/` 等の固有記述も汎用化 | 2.1-4, 2.6-2, 3.3 |
| 10 | **AGENTS.md（または docs/）にスキル運用の短い案内を追加**。特に disable-model-invocation のスキルはモデル・ドキュメントどちらからも見えない現状を解消する | 3.1 |
| 11 | **requirements-to-issues の Phase 4 を github-issues への委譲に一本化**し、`gh api` コマンドの二重管理を解消する | 2.6-1 |

### 優先度: 低（品質・整合性の底上げ）

| # | 提案 | 対応する課題 |
|---|------|-------------|
| 12 | 本文の「## When to Use」セクションを frontmatter（description / `when_to_use`）へ集約し、本文の恒常トークンコストを削る | 2.7-1 |
| 13 | **nuxt スキルを Nuxt 4 ベースで再生成**（antfu/skills のスクリプトを利用） | 2.8-1 |
| 14 | **docs/prompts/create-issues-prompt.md をアーカイブ**（役目を終えた旨を冒頭に追記、または docs/archive/ へ移動）。今後の一括起票は `/requirements-to-issues` に統一 | 3.2 |
| 15 | github-commit-push のコミットタイプに docs / test / chore を追加し、プロジェクト規約と揃える | 2.4-4 |
| 16 | github-fetch-issue の description を「実装前の要件確定用」に限定し、単なる閲覧は github-issues 側に寄せる | 2.7-2 |
| 17 | github-issues に MCP サーバー未設定時の `gh` フォールバックを一言追記する | 2.5-1 |
| 18 | **skill-creator プラグインで主要スキルの eval を作成**し、発火率と出力品質のベースライン比較を回す。`/doctor` で description の短縮・脱落も確認する | 2.9 |

---

## 5. 総評

- 最も効果が大きいのは優先度「高」の4件で、いずれも「書いてあるのに動かない／読まれない」構造的な不整合（description と invocation 設定の矛盾、デッドリンク、孤立 references、トリガー衝突）の解消。
- github-issues と nuxt は公式ベストプラクティス（トリガー語を列挙した description、1階層の progressive disclosure）に最も忠実で、他スキル改修時の参照実装にできる。
- 「汎用は `~/.claude/skills`、プロジェクト固有はリポジトリ内 `.claude/skills/`」という公式の使い分けを徹底すれば、今回の問題の多く（2.1-4, 2.6-2, 3.3）は再発しない。
