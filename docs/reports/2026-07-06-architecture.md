# memo-app 改善提案レポート

調査日: 2026-07-06 / 対象: main ブランチ (6fa6763)

## 概要

Nuxt 4 + Supabase 構成として全体的に整った実装で、Composable / Form / List の分割・型定義・テスト配置は CLAUDE.md の方針に忠実。一方で、**RLS 未設定のまま anon key を公開する運用**(2026年時点で最も典型的な Supabase 事故パターン)と、**SSR 有効のままモジュールスコープに状態を持つ Composable 設計**の2点が構造的なリスクとして残っており、優先的な対処を推奨する。

---

## 問題点

### 優先度: 高

#### 1. RLS 未設定 + anon key 公開 — 全データが第三者から読み書き・削除可能

- 該当: `supabase/migrations/0001_init.sql:1-21`(全テーブルで `enable row level security` なし)、`nuxt.config.ts:28-33`(anon key を `runtimeConfig.public` でクライアント配布)
- anon key はビルド成果物から誰でも取得できるため、RLS が無効だと URL + key を知る任意の第三者が REST API 経由で全テーブルを read/write/delete できる。2025年の CVE-2025-48757 では、まさにこのパターン(RLS 無し + anon key 公開)で 170+ の Lovable 製アプリがデータ露出した。Supabase 公式も「exposed schema(public)のテーブルでは RLS を常に有効化すること」を明言している。
- CLAUDE.md は「RLS 未定」と認識済みだが、"個人メモだから漏れても軽微" では済まず、**削除・改竄・スパム書き込み**まで可能な点が問題。
- 対応案(いずれか):
  1. **最小コスト**: RLS を有効化し、`anon` ロールに対して deny-all にした上で、Supabase Auth の匿名でない単一アカウントを作り `authenticated` ロールにのみ CRUD を許可する(ログイン画面1枚の追加で済む)。
  2. Auth を入れたくない場合、Nuxt server routes(`server/api/`)経由に切り替えて secret key をサーバー側にのみ保持し、API 側で簡易トークン認証する。
  3. 少なくとも Supabase ダッシュボードの **Security Advisor** で現状の警告を確認し、リスクを把握した上で運用する。
- 出典: [Supabase Docs: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) / [CVE-2025-48757 の解説 (vibeappscanner)](https://vibeappscanner.com/supabase-security) / [stingrai: Exposed Anon Keys, RLS, and Misconfigurations](https://www.stingrai.io/blog/supabase-powerful-but-one-misconfiguration-away-from-disaster)

#### 2. モジュールスコープの状態が SSR でクロスリクエスト共有される

- 該当: `app/composables/useDailyNew.ts:7-10`、`useTopics.ts:7-10`、`useWorkout.ts:7-14`(`items` / `loading` / `error` / `sortOrder` がモジュールトップレベルの `ref`)、`app/composables/useSupabase.ts:16`(クライアントのモジュールスコープシングルトン)
- 本アプリは SSR 有効(`nuxt.config.ts` に `ssr: false` なし)。サーバーは長寿命プロセスなので、モジュールスコープの `ref` は**全リクエストで共有され、プロセスが生きている限り残留する**。Nuxt 公式ドキュメントも「setup 外での `ref` 定義はサーバーで状態が共有されメモリリークにつながる」と明記し、`useState` の使用を推奨している。
- 派生問題として、`pages/one-new/index.vue:10` 等の `await useAsyncData('daily-new', fetchList)` は **handler が undefined を返す**ため(fetchList は void)、サーバーで取得した結果が Nuxt payload に乗らない。取得データはサーバー側モジュール状態に溜まるだけで、クライアントは再フェッチする(実質二重フェッチ)。Nuxt 4 では handler が undefined を返すと開発時警告も出る。
- 対応案(いずれか):
  1. **単一ユーザーの個人アプリなので `ssr: false`(SPA 化)が最も簡単で副作用が少ない**。Supabase 直叩き構成とも整合する。
  2. SSR を維持するなら、状態を `useState('daily-new-items', () => [])` ベースに移行し、`useAsyncData` は handler からデータを return して `data` を使う正規パターンに直す。
- 出典: [Nuxt Docs: State Management(クロスリクエスト汚染の警告)](https://nuxt.com/docs/4.x/getting-started/state-management) / [Nuxt Docs: useAsyncData](https://nuxt.com/docs/api/composables/use-async-data) / [masteringnuxt: Stop Using ref() in Nuxt](https://masteringnuxt.com/blog/stop-using-ref-in-nuxt-why-usestate-is-critical-for-ssr)

#### 3. レガシー anon key は 2026 年末に廃止予定

- 該当: `nuxt.config.ts:31`、`.env.example`(`SUPABASE_KEY=your-anon-key`)
- Supabase は JWT ベースの legacy `anon` / `service_role` キーを **2026年末で廃止**し、`sb_publishable_...` / `sb_secret_...` への移行を求めている(2025年11月以降の新規プロジェクトには legacy キー自体が発行されない)。`supabase-js` は新キーをそのまま `createClient` に渡せるため、コード変更は環境変数の値の差し替えのみ。年内に移行しないとアプリが動かなくなる。
- 出典: [Supabase Docs: Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys) / [Supabase Docs: Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys)

### 優先度: 中

#### 4. 全件フェッチ + クライアントサイドのソート/フィルタ

- 該当: `app/composables/useWorkout.ts:22`(`select('*')` で全件取得後、`:28-30` で JS フィルタ)、`useDailyNew.ts:17` / `useTopics.ts:17`(同様に全件取得後 `app/utils/sort.ts` でソート)
- 毎日書くアプリなので1年で数百〜千行規模になり、全件転送は無駄が大きい。PostgREST 側で `.eq('category', category)`・`.order('created_at', { ascending })`・`.range(from, to)` を使えばソート・絞り込み・ページングを DB に任せられる。`useWorkout` のメニュー候補用全件保持(`allRecords`)は `select('menu, category')` の軽量クエリに分離できる。

#### 5. create/update/remove のたびに全件再フェッチ

- 該当: `useDailyNew.ts:46,60,71`、`useTopics.ts:45,56`、`useWorkout.ts:63`
- `insert(...).select().single()` の戻り値をローカル配列に挿入すれば、書き込み1回につきラウンドトリップを1回削減できる(#4 と併せて対応)。

#### 6. 日付を UTC 深夜として保存している

- 該当: `app/pages/one-new/index.vue:13`、`topics/index.vue:12`、`workout/index.vue:45`(`` `${payload.date}T00:00:00.000Z` ``)
- フォームの日付(JST ローカル日付)に `Z` を付けて UTC 00:00 として保存するため、実際は「選択日の 09:00 JST」になる。JST 表示では日付がずれないため実害は小さいが、(a) 同日内で `now()` デフォルトのレコードと手動日付レコードの並び順が直感に反する、(b) UTC より西のタイムゾーンでは前日表示になる。「記録日」をローカル日付のまま `date` 型カラムに分離するか、ローカルタイムゾーンの深夜として ISO 文字列を組み立てるのが正しい。

#### 7. 機能の非対称性(編集・削除の有無がバラバラ)

- 1日1新: 編集○ / 削除○(`useDailyNew.ts:64-73`)
- トピック: 編集○ / 削除✗(`useTopics.ts` に `remove` なし)
- 筋トレ: 編集✗ / 削除✗(`useWorkout.ts` は `create` のみ。誤入力した重量・回数を UI から直せない)
- 少なくとも筋トレの削除(誤記録の訂正手段)は優先度が高い。

#### 8. `withLoading` が例外を `error` に変換しない

- 該当: `app/utils/withLoading.ts:10-14`
- `fn` 内で throw されると `error.value` は null のまま reject が伝播し、イベントハンドラ経由では unhandled rejection になる。supabase-js は通常エラーを戻り値で返すため頻度は低いが、`catch (e) { error.value = ... }` を足しておくと堅牢。

### 優先度: 低

#### 9. `intensity` の DB 制約欠如

- 該当: `supabase/migrations/0001_init.sql:18`。フォーム(`WorkoutForm.vue:35-50`)は `intensity >= 0` を検証するが DB に check がない(`reps` には `> 0` がある)。`check (intensity >= 0)` を追加。

#### 10. 削除に確認ダイアログがない

- 該当: `app/components/DailyNewList.vue:108-115`。削除ボタンが即 `remove` を emit し、取り消し手段がない。`confirm()` 一発でも入れる価値あり。

#### 11. コンポーネント間の props / disabled の不整合

- `TopicList.vue:9` は `loading` が必須、`DailyNewList.vue:9` は optional。
- `TopicList.vue:86` の編集ボタンには `:disabled="props.loading"` がない(`DailyNewList.vue:100-115` にはある)。

#### 12. エラー表示の UX / アクセシビリティ

- 該当: `pages/*/index.vue` の `<div v-if="error" class="error">`。Supabase の英語メッセージ(例: "TypeError: Failed to fetch")が生のまま出る。日本語の汎用メッセージ + 詳細は console へ。`role="alert"` も未指定でスクリーンリーダーに通知されない。
- `WorkoutCategoryTabs.vue:20-31` はタブ UI だが `role="tablist"` / `aria-selected` がない。

#### 13. テストの型・カバレッジ不備

- `app/components/__tests__/DailyNewList.spec.ts:13` — 必須 prop `sortOrder` を渡さず mount(型チェックに引っかかる状態)。
- `app/pages/workout/` にページテストなし(one-new / topics にはある)。
- `DailyNewList` / `TopicList` の編集・保存・キャンセル・削除 emit、`app/utils/`(`sortByDate` / `withLoading` / `formatDate`)が未テスト。

---

## 改善点(既存機能の品質向上)

1. **Composable の共通化** — `useDailyNew.ts` と `useTopics.ts` は items/loading/error/sortOrder/fetchList/toggleSortOrder/create/update がほぼ同一。テーブル名と型をパラメータにしたファクトリ(例: `app/composables/createCrudStore.ts`)に集約すれば、`useWorkout` 固有部分(カテゴリ・メニュー候補)だけ残して重複を大幅削減できる。
2. **フォーム / カード CSS の共通化** — `DailyNewForm.vue:66-143` と `TopicForm.vue:52-129` はスタイルがほぼ完全一致し、`WorkoutForm.vue` も大半重複。`.form` / `.label` / `.input` / `.submit-btn` / `.card` / `.empty-state` を `app/assets/global.css` へ移すか、`BaseField.vue` / `EmptyState.vue` 等の共通コンポーネント化(#70 の global.css 抽出と同方針の続き)。
3. **日付入力の共通コンポーネント化** — 3フォームで `date` の初期化(`toLocaleDateString('en-CA')`)・リセット・CalendarIcon 重ねが重複。`DateField.vue` に集約。なお CalendarIcon はクリック不可の装飾で、`::-webkit-calendar-picker-indicator` を非表示にしているため「アイコンを押しても開かない」状態。アイコン押下でピッカーを開く(`showPicker()`)と自然。
4. **Google Fonts の自己ホスト化** — `nuxt.config.ts:8-17` の CDN 読み込みはレンダーブロッキング + 外部依存。公式モジュール `@nuxt/fonts` に置き換えると自動で self-host される。
5. **supabase-js の更新** — 2.108.2 → 2.110.0(2026年6月末時点最新)。破壊的変更はないが、**2.110.0 で Node.js 20 サポートが打ち切り**なので、実行環境が Node 20 の場合は 2.109.0 に留める。出典: [supabase-js Releases](https://github.com/supabase/supabase-js/releases) / [npm](https://www.npmjs.com/package/@supabase/supabase-js)
6. **編集モードで日付を変更できない** — `DailyNewList` / `TopicList` の編集はタイトル・内容のみ。日付を間違えた場合に直せないので、編集フォームに日付フィールドを追加(#6 の日付カラム設計と併せて)。
7. **CLAUDE.md の追随** — 実装は `update` / `remove` / `toggleSortOrder` / `menuSuggestions` / `app/utils/` まで育っているが、CLAUDE.md のアーキテクチャ説明は `fetchList()` / `create()` のみで `app/utils/` もディレクトリ図にない。ドキュメントを現状に合わせて更新。

---

## 追加機能提案

### 1日1新
- **連続記録(ストリーク)表示**: 「何日連続で書けているか」をヘッダーに表示。習慣化アプリとして最も効く1機能。`created_at` の集計だけで実装可能。
- **その日のエントリ有無チェック**: 同日に既に記録があれば「今日はもう書きました」を表示(1日1新というコンセプトの担保)。
- **検索**: タイトル・内容の部分一致検索(PostgREST `.ilike()`)。

### 日々のトピック
- **削除機能**(問題点 #7 の解消)。
- **日付ごとのグルーピング表示**: 同日の複数トピックを日付見出しでまとめると読み返しやすい。`items` を `formatDate` キーで groupBy するだけで UI 改善効果が大きい。

### 筋トレ
- **記録の編集・削除**(問題点 #7 の解消。誤入力の訂正手段として最優先)。
- **前回記録の表示**: メニュー入力時に同メニューの直近の重量×回数を表示(「前回: 60kg×10」)。`allRecords` が既にあるため実装コストは低く、漸進的過負荷の判断に直結する。
- **セット数対応**: 現状は1レコード=1セット。同メニュー連続入力の「同じ内容でもう1セット」ボタン(既存の copy 機能の隣に置く)か、`sets` カラム追加。
- **重量推移グラフ**: メニューごとの intensity 推移を折れ線で表示(依存を増やしたくなければ SVG 手描きで十分)。

### 共通基盤
- **PWA 化**: スマホのホーム画面から起動する用途が主と思われるため、`@vite-pwa/nuxt` で manifest + アイコンを追加。`ssr: false` 化(問題点 #2 の対応案1)とも相性が良い。
- **エクスポート**: 全データの JSON/CSV ダウンロード。Supabase 障害・解約時のデータ保全手段。
- **ページング / 無限スクロール**: 問題点 #4 の `.range()` 対応とセットで。

---

## その他の注意事項

- **Nuxt 4.4.8 は 2026-07 時点の最新安定版**であり、本プロジェクトのバージョン選定は適切。参考: Nuxt 3 は 2026年7月末で EOL(本アプリは Nuxt 4 のため影響なし)。出典: [endoflife.date/nuxt](https://endoflife.date/nuxt) / [nuxt/nuxt Releases](https://github.com/nuxt/nuxt/releases)
- **supabase-js 本体に既知の直接的な脆弱性は報告されていない**(Snyk DB 上でクリーン)。出典: [Snyk: @supabase/supabase-js vulnerabilities](https://security.snyk.io/package/npm/%40supabase%2Fsupabase-js)
- **CVE-2026-31813(Supabase Auth の OIDC 検証不備、Apple/Azure プロバイダ)** はホスト側で修正済みかつ本アプリは Auth 未使用のため影響なし。ただし将来 Auth を導入する際(問題点 #1 の対応案1)はセルフホストでないため特別な対応は不要。出典: [SentinelOne CVE-2026-31813](https://www.sentinelone.com/vulnerability-database/cve-2026-31813/)
- **Nuxt 4 の `useAsyncData` はリアクティブなキー(getter)をサポート**しており、`workout/index.vue:25-28` のキー関数によるカテゴリ切替再フェッチ自体は正規のパターン。問題は handler が値を返していない点のみ(問題点 #2 参照)。出典: [Nuxt Docs: useAsyncData](https://nuxt.com/docs/api/composables/use-async-data)
- `.env` / `.env.account` は gitignore 済みで、リポジトリに秘密情報のコミットはない(確認済み)。
