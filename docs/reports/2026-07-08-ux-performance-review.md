# メモアプリ UI/UX・パフォーマンス改善レポート

作成日: 2026-07-08
対象: `/one-new`（1日1新）、`/topics`（日々のトピック）、`/workout`（筋トレ）の3機能全体

コードベース探索（ページ・コンポーネント・composable・utils・CSS・設定ファイル全般）に基づく所見と改善提案をまとめる。

---

## 1. UI/UX観点

### 1.1 ローディング状態が視覚的にわからない
- `useDailyNew.ts:14`, `useTopics.ts:14`, `useWorkout.ts:19` — `loading` は「初回取得時（`items.length === 0`）」しか `true` にならない。2回目以降（作成・更新・削除・ソート切替・タブ切替）の再フェッチ中はローディング表示が一切出ず、ユーザーには一覧が一瞬固まったように見える。
- スピナーやスケルトンUIはアプリ全体に存在せず、`loading` はフォームの送信ボタンを `disabled` にするだけ（`DailyNewForm.vue:62`, `TopicForm.vue`, `WorkoutForm.vue:131`）。

**提案**: 一覧側にも `loading` を渡し、フェッチ中は簡易スピナーやオーバーレイ（薄い半透明＋中央スピナー）を出す。特に `WorkoutList.vue` は現状 `loading` prop 自体を受け取っていない（`workout/index.vue:70-75`）。

### 1.2 エラー表示が弱い
- 3ページとも `<div v-if="error" class="error">{{ error }}</div>` という素のテキスト表示のみ（`one-new/index.vue:28`, `topics/index.vue:23`, `workout/index.vue:62`、スタイルは `global.css:38-44`）。
- 再試行ボタンがない、`role="alert"` や `aria-live` がなくスクリーンリーダーに通知されない、表示位置がページ最上部固定でトースト的な自動消去もない。

**提案**: エラーメッセージに `role="alert"` を付与し、「再試行」ボタンを添える。恒久表示ではなくトースト通知＋一定時間後の自動消去、または明示的な閉じるボタンを検討。

### 1.3 削除操作に確認がない
- `DailyNewList.vue:108-115` の削除ボタンは即座に `emit('remove', item.id)` を呼び、確認ダイアログが存在しない。誤タップでデータが即消える。

**提案**: `confirm()` やインラインの「本当に削除しますか？」確認ステップ、もしくは削除直後に「元に戻す」を出せるトースト（Undo）を追加する。

### 1.4 アクセシビリティ全般の不足
- リポジトリ全体で `aria-`, `role=`, `tabindex` の使用箇所がゼロ（grep結果）。
- フォームの `label`/`for` 対応自体はできている（例: `DailyNewForm.vue:36-43`）が、以下が未対応:
  - 編集モードに入った際（`startEdit` 呼び出し時、`DailyNewList.vue:22-26`）に編集用 `input` へオートフォーカスしない。
  - エラー領域に `role="alert"` がない（1.2 と同じ）。
  - アイコンのみのボタンはないため致命的ではないが、SVGアイコンに `aria-hidden="true"` を付けていない（スクリーンリーダーが装飾アイコンを読み上げる可能性）。

**提案**: 編集開始時に `nextTick` + `ref` でオートフォーカス、装飾用SVGへの `aria-hidden`、エラー領域への `role="alert"` を追加。

### 1.5 ダークモード非対応
- `@media (prefers-color-scheme: dark)` の使用箇所がゼロ。`global.css` や各コンポーネントの配色（`#f9f9f9`, `white` 等）はすべて固定のライトテーマ。

**提案**: 個人用アプリでも夜間利用を考えるとダークモード対応の価値は高い。CSS変数（`--nav-height` 等と同様に色トークンも変数化）＋ `prefers-color-scheme` で対応可能。

### 1.6 レスポンシブ対応がない
- `@media` クエリがプロジェクト全体でゼロ。`.page`（`global.css:19-24`）や各カードは固定px前提のモバイルレイアウトで、タブレット・PC幅で表示すると間延びする（`max-width` 制約なし）。

**提案**: `.layout`（`layouts/default.vue`）に `max-width: 480px; margin: 0 auto;` 程度を加えるだけでも、PCブラウザで開いた際の見栄えが大きく改善する。

### 1.7 バリデーションの理由が見えない
- 各フォームは `computed(isDisabled)` で送信ボタンを無効化するのみ（`WorkoutForm.vue:35-50` が最も複雑）。ユーザーはボタンが押せない理由（何文字未入力か、数値が不正かなど）を知る手段がない。

**提案**: 個別フィールドにインラインのバリデーションメッセージ（例:「回数は1以上の整数で入力してください」）を出す。

### 1.8 機能の非対称性: トピックだけ削除できない
- `useTopics.ts` には `fetchList` / `create` / `update` はあるが `remove` が存在しない（`useDailyNew.ts` と `useWorkout.ts` には作成系はあるが、削除は `useDailyNew` のみ実装）。一日1新は編集・削除両方可能、トピックは編集のみ、筋トレはどちらも不可という機能差がある。

**提案**: 意図的な仕様でなければ、3機能で編集・削除の可否を揃える（特にトピックへの削除機能追加）。

### 1.9 筋トレのメニュー候補チップの並び順
- `getMenuCandidates`（`useWorkout.ts:71-79`）は `Set` 生成後の順序（＝データ取得順）で先頭5件を出すだけで、頻度順・直近順ではない。よく使うメニューが埋もれる可能性がある。

**提案**: 直近使用日または使用頻度でソートしてから上位5件を候補にする。

---

## 2. パフォーマンス観点

### 2.1 全件取得＋クライアント側ソート（ページネーションなし）
- `useDailyNew.ts:17`, `useTopics.ts:17`, `useWorkout.ts:22` はいずれも `.select('*')` で件数制限なし。データが増えるほど転送量・JSON パース・`sortByDate`（`sort.ts`）のコストが線形に増加する。

**提案**: Supabase の `.range()` や `.order('created_at', {ascending: ...}).limit(n)` を使ったページネーション（無限スクロールや「もっと見る」）を導入し、DB側でソート・絞り込みを行う。

### 2.2 筋トレ: カテゴリ切替のたびに全カテゴリを再取得
- `useWorkout.ts` の `fetchList(category)`（17-35行）は常に `workout_records` の全カテゴリを取得し、`allRecords` に保持後、JS側 `.filter()` でカテゴリ絞り込みしている（28-31行）。
- `workout/index.vue:25-28` の `useAsyncData(() => \`workout-${selectedCategory.value}\`, ...)` はキーが変わるたびに `fetchList` を再実行するため、**タブを切り替えるたびに全件を毎回ネットワーク越しに再取得**している。DB側で `.eq('category', category)` すれば転送量を必要な分だけに抑えられる。
- メニュー候補（`menuSuggestions`, `getMenuCandidates`）は全カテゴリのデータが必要という設計意図（`useWorkout.ts:8-9` のコメント）はあるが、それなら「候補用の軽量クエリ（`select('menu, category')` のみ）」と「表示用の絞り込みクエリ（`.eq('category', ...)`）」を分離するのが妥当。

**提案**: 一覧表示は `.eq('category', category)` でDB側フィルタ、メニュー候補は列を絞った軽量クエリに分離する。

### 2.3 作成・更新・削除のたびに全件再フェッチ（楽観的更新なし）
- `create` / `update` / `remove` はすべて成功後に `await fetchList()` を呼び、DBへ再度全件問い合わせしている（`useDailyNew.ts:46,60,71`、`useTopics.ts:45,56`、`useWorkout.ts:63`）。ローカル配列への直接追加・更新・削除ではないため、1操作ごとに不要なネットワーク往復が発生し体感速度が落ちる。

**提案**: Supabase の `insert().select()` / `update().select()` のレスポンスをそのままローカル配列に反映する楽観的更新に変更し、全件再フェッチを廃止する。エラー時のみロールバック（再フェッチ）すればよい。

### 2.4 `useAsyncData` のキャッシュが実質機能していない
- `workout/index.vue:26` はカテゴリごとに異なるキー（`workout-${category}`）を使うが、内部の `fetchList` は毎回全カテゴリを取得するため、Nuxtのキャッシュ機構（同一キーでの再利用）が活かされていない。

**提案**: 2.2 の修正（DB側フィルタ）と合わせて、キーとクエリ内容を一致させることでキャッシュが正しく効くようにする。

### 2.5 モジュールスコープのシングルトン state による SSR リスク
- `items` / `allRecords` / `loading` / `error` / `sortOrder` はすべて各composableのモジュールスコープの `ref`（`useDailyNew.ts:7-10`、`useTopics.ts:7-10`、`useWorkout.ts:7-14`）。`useSupabase()` のクライアントをモジュールスコープに保持する設計判断は `AGENTS.md` に明記された意図的なものだが、データ本体（`items` 等）まで同じ理由でモジュールスコープにする必然性はない。単一ユーザー前提の現状では実害は小さいが、Nuxtのサーバーサイドレンダリングでは本来リクエストごとに独立させるべき状態がプロセス全体で共有される構造になっている。

**提案**: 将来的にSSRでの同時リクエストを扱う可能性があるなら、`useState` ベースの管理に寄せる（Supabaseクライアント自体は現状のシングルトンのままでよい）。当面のリスクは低いため優先度は低め。

### 2.6 候補計算のコスト
- `menuSuggestions`（`useWorkout.ts:67-69`）・`getMenuCandidates`（71-79行）は `allRecords` 全体から `new Set()` → `sort`/`filter` する `computed`。`allRecords` が更新されるたびに再計算されるため、記録件数が数千件規模になると無視できないコストになる。

**提案**: 2.2 の対応（候補専用の軽量クエリ）と合わせて、DB側で `distinct` 相当のクエリを使うか、件数が実用上増えた時点で再検討する（現状件数では緊急度は低い）。

### 2.7 外部フォント読み込み
- `nuxt.config.ts:9-16` で Google Fonts を CDN から読み込み。`preconnect` は設定済みで大きな問題はないが、セルフホスト（フォントファイルをプロジェクトに同梱）にすればさらに外部リクエストを1つ減らせる。優先度は低い。

---

## 3. 追加レビュー（コード再巡回3周分）

初回レポート後、未読だった `TopicForm.vue` / `TopicList.vue` / `CalendarIcon.vue`、`shared/types/domain.ts`、`supabase/migrations/0001_init.sql`、テストディレクトリ一式、`public/` の有無を含めて計3周再確認した。追加で見つかった項目のみ記載する（既出の指摘と重複するものは省略）。

### 3.1 筋トレページにページレベルのテストがない
- `app/pages/one-new/__tests__/index.spec.ts`、`app/pages/topics/__tests__/index.spec.ts` は存在するが、`app/pages/workout/__tests__/` ディレクトリ自体が存在しない。3機能中もっともロジックが複雑（カテゴリタブ・コピー機能・候補チップ・全件再取得の絡み）な画面のテストカバレッジが最も薄い。
- `AGENTS.md` の「新機能・修正にはテストを追加すること」という方針と整合しないため、次にworkout関連を修正する際は合わせてページテストを追加するのが望ましい。

### 3.2 PWA化のための土台（manifest/service worker）が皆無
- `public/` ディレクトリが存在せず、`nuxt.config.ts` にも `manifest`/`vite-pwa` 等の設定がない。favicon もデフォルトのまま。
- 毎日使う個人用アプリという性質上、ホーム画面インストールやオフライン対応の恩恵が大きい（詳細は4章）。

### 3.3 `workout_records.created_at` に明示的なインデックスがない
- `0001_init.sql:14-21` では `created_at` は `default now()` のみで、ソート・将来のページネーション（`.order('created_at')`）で使う列にインデックスがない。現状のデータ量では影響は軽微だが、2.1のページネーション導入と合わせて検討するとよい。

### 3.4 自重種目で「0kg」表示になり不自然
- `WorkoutList.vue:58` は常に `{{ item.intensity }}kg × {{ item.reps }}回` と表示する。懸垂・腕立て伏せなど自重種目を重量0で記録した場合「0kg」という表記になり、体感として不自然（0kgは「無重量」を意味せず「未入力」に見える）。

**提案**: `intensity` が0の場合は「自重」等の表記に切り替える、または種目登録時に「自重種目」フラグを持たせる。

---

## 4. Web調査に基づく機能提案

日記・習慣トラッキング系アプリ、筋トレ記録アプリの2026年時点のトレンドを調査し、本アプリに適合する機能を選定した。

### 4.1 ストリーク表示・カレンダーヒートマップ（3機能共通、効果大）
習慣トラッカー系アプリでは「ワンタップのチェックイン」「ひと目でわかるストリークやヒートマップ」「信頼できるリマインダー」が特に重要な機能として挙げられている（[HabitBox](https://habitbox.app/blog/best-habit-tracker-app)）。GitHubのコントリビューショングラフのような月表示のヒートマップを `/one-new` や `/topics` のトップに置くだけで、「今日は書いたか」「何日続いているか」が一目でわかり、継続のモチベーションになる。

**適合理由**: 「1日1新」はまさに継続習慣の記録であり、ストリーク可視化との相性が非常に良い。実装コストも比較的低い（`created_at` の日付集合からクライアント側で描画可能）。

### 4.2 筋トレ: 種目別の推移グラフ・自己ベスト(PR)表示
2026年の筋トレアプリレビューでは、重量・回数・推定1RMのグラフ表示とPR（自己ベスト）通知が「長期的な成長を実感するために不可欠」な機能として繰り返し挙げられている（[Fitbod](https://fitbod.me/blog/best-workout-tracker-apps-for-2026/), [Hevy](https://www.hevyapp.com/best-workout-tracker-app/)）。

**適合理由**: 現状の `useWorkout` はメニュー候補（直近使った種目名の補完）までは実装済みだが、「同じ種目の過去記録との比較」ができない。種目名でグルーピングし、重量×回数の推移を簡易折れ線グラフで表示するだけでも実用性が大きく上がる。新しい依存ライブラリを増やしたくない場合はSVGで自前描画も可能な規模感。

### 4.3 PWA化（ホーム画面インストール・オフライン対応）
PWAは「ホーム画面に追加」だけでアプリストアなしにネイティブアプリ的な体験を提供でき、オフラインでも動作する点が2026年時点でも引き続き強みとされている（[Mobiloud](https://www.mobiloud.com/blog/progressive-web-apps), [WeWeb](https://www.weweb.io/blog/progressive-web-application-guide)）。iOS 26以降はホーム画面追加時にデフォルトでWebアプリとして開く挙動になっている点も追い風。

**適合理由**: 本アプリは単一ユーザーが毎日開くツールであり、ブラウザのブックマークよりホーム画面アイコンから一発起動できる方が習慣化に直結する。`@vite-pwa/nuxt` 等の導入で `manifest.json` とオフラインキャッシュ用の最小限のService Workerを追加するだけでも効果が見込める（フル機能のオフライン編集同期までは不要）。

### 4.4 データエクスポート（バックアップ）
習慣トラッカーの比較記事でも「クリーンなデータエクスポート」が重要機能の一つとして挙げられている（[HabitBox](https://habitbox.app/blog/best-habit-tracker-app)）。

**適合理由**: RLS未設定・単一ユーザー運用という現状のセキュリティ前提を踏まえると、万一のSupabaseプロジェクト障害やキー漏洩時の復旧手段として、CSV/JSONへのワンクリックエクスポート機能があると安心感が高い。実装コストも低い（既存の全件取得ロジックをCSV変換するだけ）。

### 4.5 月次・週次の振り返りサマリー
習慣アプリでは週次・月次の達成率表示が定番機能となっている（[Habitify](https://habitbox.app/blog/best-habit-tracker-app) 系レビュー各種）。

**適合理由**: 「1日1新」「トピック」の記録数推移や、「筋トレ」の部位別トレーニング頻度を月次でまとめて表示すると、記録が単なるログで終わらず振り返りに使える。優先度は他項目より低いが、4.1のヒートマップ実装後の自然な拡張として位置づけられる。

---

## 5. まとめ（優先度目安）

| 優先度 | 項目 |
|---|---|
| 高 | 2.2 筋トレのカテゴリ切替時の無駄な全件再取得（DBフィルタへ変更） |
| 高 | 2.3 create/update/remove後の全件再フェッチ→楽観的更新 |
| 高 | 1.3 削除確認ダイアログの追加 |
| 中 | 1.1 ローディング表示（スピナー等）の追加 |
| 中 | 1.2 エラー表示の改善（role="alert" ＋再試行） |
| 中 | 2.1 ページネーション導入（データ増加への備え） |
| 中 | 1.6 レスポンシブ対応（max-width設定のみでも効果大） |
| 中 | 4.1 ストリーク表示・カレンダーヒートマップ（機能提案・実装コスト低め） |
| 中 | 3.1 筋トレページのテスト追加 |
| 低 | 1.5 ダークモード対応 |
| 低 | 1.4 アクセシビリティ細部（フォーカス管理、aria-hidden） |
| 低 | 1.8 トピックの削除機能追加（仕様次第） |
| 低 | 2.5 モジュールスコープstateのuseState移行 |
| 低 | 2.6 候補計算の最適化、2.7 フォントのセルフホスト |
| 低 | 3.3 created_atへのインデックス、3.4 自重種目の表記 |
| 検討 | 4.2 筋トレ推移グラフ・PR表示、4.3 PWA化、4.4 データエクスポート、4.5 月次振り返り |

---

## Sources（4章の機能提案の参照元）

- [9 Best Apps for Habit Tracking in 2026 (Free Picks Tested) | HabitBox Blog](https://habitbox.app/blog/best-habit-tracker-app)
- [Best Workout Tracker Apps For 2026: Smart Tools To Help You Stay Consistent – Fitbod](https://fitbod.me/blog/best-workout-tracker-apps-for-2026/)
- [Best Workout Tracker App for 2026: Top 7 Options Reviewed – Hevy](https://www.hevyapp.com/best-workout-tracker-app/)
- [What Is a PWA? the Ultimate Guide to Progressive Web Apps in 2026 – Mobiloud](https://www.mobiloud.com/blog/progressive-web-apps)
- [What Is a Progressive Web App? PWA Guide for 2026 – WeWeb](https://www.weweb.io/blog/progressive-web-application-guide)
