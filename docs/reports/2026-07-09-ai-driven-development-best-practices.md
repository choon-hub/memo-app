# AI 駆動開発ベストプラクティス調査レポート（2026-07-09）

2026年7月時点の最新情報を Web 検索・公式ドキュメントから収集し、
（1）汎用的なベストプラクティスと（2）本プロジェクト（memo-app）に適用できる施策をまとめる。

情報源は末尾の「参考文献」を参照。一次情報（Claude Code 公式ドキュメント・Anthropic 公式ブログ）を軸に、
2026年のコミュニティ記事・調査で補強した。

---

## 1. 2026年の大きな潮流

### 1.1 「Vibe Coding」から「Agentic Engineering」へ

- 2025年に流行した「雰囲気で指示して AI に書かせる」スタイル（vibe coding）は、
  **もっともらしいが意図からズレたコード（drift）** を量産する失敗モードとして総括されつつある
- 2026年の主要ツール（Claude Code、GitHub Spec Kit、AWS Kiro、Cursor 等）はいずれも
  **Spec-Driven Development（SDD、仕様駆動開発）** の仕組みを標準搭載
- Stack Overflow 2026 開発者調査では **92% の開発者が AI コーディングツールを日常利用**
  （2024年の65%から急増）。差がつくのは「生成速度」ではなく **検証の規律（verification discipline）**

### 1.2 ボトルネックは生成ではなく検証

- 2026年の arXiv 研究では、AI エージェントが既存テストを壊す回帰率が課題として定量化され、
  事前の影響分析で回帰率を 6.08% → 1.82%（約70%削減）にできたと報告
- 良い仕様（spec）の6要素：**成果物・スコープ境界・制約・過去の決定事項・タスク分解・検証条件**
- SDD はユニットテストでは構造的に検出できない「アーキテクチャ違反」「API 契約からの逸脱」を捕捉する

---

## 2. 汎用ベストプラクティス

### 2.1 コンテキストウィンドウが最重要リソース

ほぼすべてのプラクティスは「**コンテキストは埋まると性能が落ちる**」という単一の制約から導かれる。

- **`/clear` を無関係なタスクの間で必ず実行**する。長いセッションに複数タスクを詰め込まない
- **2回修正して直らなければ `/clear`** して、学んだことを盛り込んだ良い初回プロンプトで仕切り直す
  （失敗した試行でコンテキストが汚染された状態で修正を重ねるより、ほぼ常に良い結果になる）
- 大規模な調査・探索は **サブエージェントに委譲**し、要約だけをメイン会話に戻す
- `/compact <指示>` で圧縮内容を制御。CLAUDE.md に
  「compact 時は変更ファイル一覧とテストコマンドを必ず保持」のような圧縮指示を書ける
- ちょっとした確認は `/btw`（履歴に残らないサイド質問）を使う

### 2.2 検証ループを渡す — 「見て確認する係」を人間からコードに移す

AI は「できたように見える」時点で止まる。**pass/fail を返すチェックを渡す**と、
自分で実行→結果を読む→修正のループが閉じ、放置できるセッションになる。段階は4つ：

1. **プロンプト内で**：「実装後にテストを実行し、通るまで直して」と同一メッセージで指示
2. **セッション全体で**：`/goal` 条件として設定（毎ターン後に別評価器が再チェック）
3. **決定論的ゲートとして**：Stop hook でテスト/lint をスクリプト実行し、通るまでターン終了をブロック
4. **第三者の目で**：新しいコンテキストのサブエージェントに diff をレビューさせる（adversarial review）

補足：

- 成功の主張ではなく **証拠（テスト出力・実行コマンドと結果・スクリーンショット）** を出させる
- UI 変更は「スクリーンショットを撮って元デザインと比較し、差分を列挙して直す」まで指示する
- 「ビルドが落ちる」ではなく「このエラーで落ちる。**根本原因を直し**、エラーを抑制しない」と指示する
- レビュー担当エージェントは「探せと言われれば必ず何か報告する」ため、
  **正当性・要件に影響する指摘のみ報告させる**（過剰な防御コード・抽象化を防ぐ）

### 2.3 Explore → Plan → Code → Commit

- 不確実性が高い・複数ファイルにまたがる・馴染みのないコードを触るタスクは
  **Plan mode で調査→計画→承認→実装** の順に分離する
- 逆に **diff を一文で説明できる小タスクは計画をスキップ**して直接やらせる（計画はオーバーヘッド）
- 大きめの機能は「**AI に自分をインタビューさせて SPEC.md を書かせ、新セッションで実装**」が有効。
  仕様が自己完結（関連ファイル・スコープ外・E2E 検証手順を含む）だと実装を見張る時間より費用対効果が高い

### 2.4 プロンプトは具体的に、コンテキストはリッチに

- 悪い例「foo.py のテストを書いて」→ 良い例「foo.py のログアウト済みユーザーのエッジケースをカバーするテストを書いて。モックは避けて」
- **既存パターンを指させる**：「ホームの既存ウィジェット（HotDogWidget.php が良い例）のパターンに従って実装して」
- `@ファイル参照`・画像ペースト・URL 提示・`cat error.log | claude` のパイプ入力を活用
- バグ報告は「症状＋ありそうな場所＋直った状態の定義＋**再現する失敗テストを先に書く**」

### 2.5 カスタマイズ機構の使い分け（公式の判断基準）

| 機構 | 使いどころ | 特性 |
|---|---|---|
| **CLAUDE.md** | ビルドコマンド・規約・チーム規範などの常時必要な事実 | 毎セッション読み込み（常駐） |
| **Rules** | 特定パスへの制約（例：API ハンドラは Zod 必須） | パススコープで読み込み |
| **Skills** | 手順化されたワークフロー・ドメイン知識 | 必要時にオンデマンド読み込み |
| **Subagents** | 隔離したい探索・監査・レビュー | 別コンテキストで実行、要約のみ返る |
| **Hooks** | 例外なく毎回実行すべき処理（lint、危険操作ブロック） | 決定論的（モデル非依存） |

CLAUDE.md の鉄則：

- **1行ごとに「これを消すと Claude はミスするか？」を自問**し、しないなら削る。
  肥大化した CLAUDE.md は重要なルールがノイズに埋もれ、**半分無視される**
- 含める：推測不能なコマンド、デフォルトと異なるスタイル規約、ブランチ/PR 規約、環境の癖、非自明な挙動
- 除外する：コードを読めば分かること、標準的な言語規約、頻繁に変わる情報、「きれいなコードを書け」的な自明事項
- ルールが守られない場合、まず「ファイルが長すぎないか」「表現が曖昧でないか」を疑う。
  Claude が指示なしでも正しくやれることは削除するか hook に変換する

### 2.6 権限・環境設定

- 承認クリックの形骸化を防ぐ3手段：**auto mode**（分類器が危険操作のみブロック）、
  **allowlist**（`npm run lint` 等の既知安全コマンドを許可）、**sandbox**（OS レベル隔離）
- 外部サービスは **CLI ツール（`gh`、`aws`、`supabase` 等）経由が最もコンテキスト効率が良い**。
  未知の CLI も `--help` から学習させられる
- 型付き言語では **code intelligence 系プラグイン**でシンボルナビゲーションと編集後の自動エラー検出を付与

### 2.7 並列化とスケール

- **git worktree** で複数セッションを衝突なく並行（Issue 単位の並行開発）
- **Writer/Reviewer パターン**：実装セッションと、その diff を新規コンテキストでレビューするセッションを分ける。
  「自分が書いたコードへのバイアス」がないため、レビュー品質が上がる
- テスト作成と実装を別セッションに分ける TDD 変形も有効
- **headless モード（`claude -p`）** で CI・pre-commit・一括マイグレーション（ファイルごとにループ実行）へ組み込み。
  `--allowedTools` で権限を絞り、2〜3ファイルで試してから全量実行する

### 2.8 よくある失敗パターン（公式の列挙）

| 失敗 | 対策 |
|---|---|
| キッチンシンク・セッション（1セッションに複数タスク） | `/clear` で区切る |
| 修正の繰り返し（直らないのに修正を重ねる） | 2回失敗したら `/clear`＋改善プロンプト |
| 肥大化 CLAUDE.md | 容赦なく剪定、hook 化 |
| 検証なしの信頼（もっともらしい実装を鵜呑み） | 検証手段がないなら出荷しない |
| 際限ない調査（スコープなしの「調べて」） | 調査を絞るかサブエージェントへ |

---

## 3. 本プロジェクト（memo-app）への適用

### 3.1 既にベストプラクティスに沿っている点

| 項目 | 現状 |
|---|---|
| CLAUDE.md → AGENTS.md import | 正本一元化・簡潔さの方針に合致 |
| hooks（.env 保護・prettier 自動整形） | 「毎回必須の処理は hook」の原則どおり |
| CI（PR/push で test + lint） | 決定論的な検証ゲートが既にある |
| スキル分割（fetch-issue / implement / test / review / commit-push / create-pr） | Issue ライフサイクルの手順が Skill 化済み。SDD の「プロセスの再現性」に合致 |
| `docs/issues/memo-app-issues.md` に受け入れ条件 | spec-driven の下地がある |
| テスト方針の明文化＋共通モック（`test/mocks/supabase.ts`） | 検証ループの土台が整備済み |

### 3.2 改善提案（優先度順）

#### 提案1：Issue テンプレートに「検証条件」を必須化する（SDD の徹底）

- 現状の受け入れ条件に加え、**「エージェントが自分で実行できる pass/fail チェック」** を Issue に必ず書く。
  例：「`npx vitest run app/composables/__tests__/useXxx.spec.ts` が通る」「`/workout` でカテゴリ切替後も入力値が保持される（コンポーネントテストで検証）」
- `github-fetch-issue` → `github-implement` の流れで、検証条件がそのままエージェントの終了条件になる
- `.github/ISSUE_TEMPLATE/` が作成済みなので、テンプレートに「検証条件」セクションを追加するだけでよい

#### 提案2：github-review を「fresh-context の adversarial review」に寄せる

- 公式推奨は「**実装した本人ではなく、diff と基準だけを見る新規コンテキスト**」でのレビュー
- `github-review` スキルをサブエージェント（または `/code-review`）実行にし、
  「正当性・要件への影響がある指摘のみ報告。スタイル指摘はしない」を明記する
  （指摘を出すこと自体が目的化して過剰防御コードが生まれるのを防ぐ）

#### 提案3：検証ループの最終段を「実アプリ駆動」まで伸ばす

- 現状の検証は test + lint。UI 変更については
  「`npm run dev` で起動しスクリーンショットを撮って比較」まで指示に含める（`/verify`・`/run` スキルが利用可能）
- 長時間の自律実行をさせる場合は Stop hook で `npm run test && npm run lint` をゲート化する選択肢もある
  （現状は CI が同role を担っているため、必須ではなくオプション）

#### 提案4：Issue 並行開発に git worktree を使う

- 独立した Issue（例：deploy-01 と機能 Issue）は worktree ＋並行セッションで進める
- ブランチ規約 `<type>/<issue番号>-<説明>` が既にあるため、worktree 名にそのまま流用できる

#### 提案5：RLS 未設定の解消（AI 以前にセキュリティ基盤）

- `AGENTS.md` に「RLS 未設定」と明記されており、anon key 前提では本番公開時のリスクになる
- `supabase-migration` スキルは既に「RLS 有効化を既定で検討」となっているので、
  既存3テーブルへ RLS を有効化するマイグレーションを 1 Issue として起票する
  （`docs/issues/deploy-02-supabase-production.md` と統合可能）

#### 提案6：CLAUDE.md / AGENTS.md の定期剪定と compaction 指示

- 「Claude が指示なしでも正しくやれる行は削る」を月次などで実施（肥大化 → ルール無視の悪循環を防ぐ）
- CLAUDE.md に compaction 指示を1行追加する：
  「compact 時は変更ファイル一覧・実行したテストコマンド・未解決の受け入れ条件を保持すること」

#### 提案7：権限プロンプトの棚卸し

- `/fewer-permission-prompts` で過去の許可履歴から allowlist を生成し、
  `.claude/settings.json` の恒久 allow を最適化する（既に基盤はあるため作業は小さい）

#### 提案8（オプション）：CI への headless Claude 組み込み

- `claude -p` を GitHub Actions に組み込み、PR に対する自動レビューコメントや
  「CI の失敗テストを読んで根本原因を修正する」ワークフローを追加できる
- 個人開発ではコスト対効果を見て判断。まずは提案1〜3の「ローカルでの検証規律」を優先

### 3.3 適用ロードマップ（目安）

1. **今すぐ（小・効果大）**：提案1（Issue テンプレートに検証条件）、提案6（compaction 指示1行）
2. **今週中**：提案2（review の adversarial 化）、提案5（RLS Issue 起票）、提案7（権限棚卸し）
3. **必要になったら**：提案3（実アプリ駆動検証）、提案4（worktree 並行）、提案8（CI 組み込み）

---

## 参考文献

### 一次情報（公式）

- [Best practices for Claude Code — Claude Code Docs](https://code.claude.com/docs/en/best-practices)
- [Steering Claude Code: when to use CLAUDE.md, skills, hooks, and subagents — Anthropic](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)

### 2026年のコミュニティ記事・調査

- [Spec-Driven Development with AI Coding Agents (2026) — zeroshot](https://zeroshot.ghost.io/spec-driven-development-with-ai-coding-agents/)
- [Spec + TDD: The Combination That Actually Produces Shippable AI Code — Augment Code](https://www.augmentcode.com/guides/spec-tdd-shippable-ai-generated-code)
- [Spec-Driven Development (SDD): The Definitive 2026 Guide — BCMS](https://thebcms.com/blog/spec-driven-development)
- [Spec-Driven Development: A Spec-First Approach to AI-Native Engineering — Microsoft](https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering)
- [Agentic AI Coding Best Practices in 2026 — From Vibe Coding to Real Engineering — Medium](https://medium.com/@developerawam/agentic-ai-coding-best-practices-in-2026-from-vibe-coding-to-real-engineering-fc3ca30d5884)
- [Claude Code Best Practices: 12 Patterns Agentic Engineers Use — Level Up Coding](https://levelup.gitconnected.com/claude-code-best-practices-12-patterns-agentic-engineers-use-65264e3eb919)
- [The Complete Guide to AI Coding Agents in 2026 — XiDao Tech Blog](https://blog.xidao.online/en/posts/ai-coding-agents-2026-guide/)
- [Claude Code Guide 2026: 25 Features with Examples — MarkTechPost](https://www.marktechpost.com/2026/06/14/claude-code-guide-2026-25-features-with-examples-demo/)
- [Claude Code Customization: CLAUDE.md, Slash Commands, Skills, and Subagents — alexop.dev](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [From Prompt to Process: a Process Taxonomy and Comparative Assessment of Frameworks Supporting AI Software Development Agents — arXiv](https://arxiv.org/pdf/2606.04967)
