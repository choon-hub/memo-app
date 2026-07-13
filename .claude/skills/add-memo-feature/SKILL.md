---
name: add-memo-feature
description: Scaffolds a new CRUD memo feature (composable, Form/List components, page, and tests) matching this project's established pattern, using useDailyNew/DailyNewForm/DailyNewList/pages/one-new as the canonical template. Use when adding a new record-keeping feature parallel to 一日一新/トピック/筋トレ, e.g. "新しい記録機能を追加して".
allowed-tools: Read, Write, Edit, Bash(npm run test), Bash(npm run lint), Skill
---

# Add Memo Feature

Scaffolds a new feature shaped like the existing `daily_new` / `topics` / `workout_records` features (see AGENTS.md's project overview).

## Canonical example

Read these four files plus their tests before generating anything, and match them exactly rather than writing generic Vue/Nuxt boilerplate from memory:

- `app/composables/useDailyNew.ts` — most complete composable (has create/update/remove/toggleSortOrder)
- `app/components/DailyNewForm.vue`, `app/components/DailyNewList.vue`
- `app/pages/one-new/index.vue`
- `app/composables/__tests__/useDailyNew.spec.ts`, `app/components/__tests__/DailyNewForm.spec.ts`, `app/components/__tests__/DailyNewList.spec.ts`, `app/pages/one-new/__tests__/index.spec.ts`

If the new feature needs category-style filtering (like workout's chest/back/legs), also read `app/composables/useWorkout.ts` for the `allRecords` / `getMenuCandidates` split pattern instead of the plain `useDailyNew` shape.

## Inputs to gather before generating

- Feature display name (Japanese) + kebab-case route/identifier + snake_case table name
- Fields: name, type, required/optional, validation rules
- Category filtering needed?
- Which of edit / delete / sort-toggle to include — **default to all three** (matching `useDailyNew`) unless the user explicitly opts out. Feature asymmetry (topics has no delete, workout has no edit/delete) was flagged as a problem in `docs/reports/2026-07-06-architecture.md` (#7); don't add a new asymmetric feature without the user explicitly asking for it.

## Steps

1. **Schema**: if a new table or column is needed, invoke the `supabase-migration` skill first — don't hand-write migration SQL here.
2. **Domain type**: add the type to `shared/types/domain.ts`, following the shape of `DailyNew` / `WorkoutRecord`.
3. **Composable**: create `app/composables/use<Feature>.ts` mirroring `useDailyNew.ts` — module-scope `items` / `loading` / `error` / `sortOrder` refs, `fetchList` / `create` / `update` / `remove` / `toggleSortOrder`, using `useSupabase()` (never `createClient` directly) and `~/utils/sort` / `~/utils/withLoading`.
4. **Components**: create `<Feature>Form.vue` and `<Feature>List.vue` under `app/components/`, matching prop shape, emit names, and CSS class names (`.form`, `.field`, `.label`, `.input`, `.submit-btn`, `.card`, `.empty-state`, etc.). Make the `loading` prop **required**, not optional — `TopicList`'s optional `loading` is the exact prop inconsistency flagged in the architecture report (#11); don't repeat it. Every action button should be `:disabled` while `loading` is true.
5. **Page**: create `app/pages/<feature>/index.vue` mirroring `pages/one-new/index.vue` — destructure the composable, `await useAsyncData(...)`, wire submit/update/remove handlers, render `<Feature>Form>` + `<Feature>List>`.
6. **Tests** — write all three levels, including the page test:
   - Composable spec in `app/composables/__tests__/`: `vi.mock('~/composables/useSupabase', ...)` returning `test/mocks/supabase.ts`'s `mockSupabaseClient`; call `resetMocks()` in `beforeEach`; cover fetch (success/empty/error), create, update, remove, toggleSortOrder.
   - Component specs in `app/components/__tests__/` for Form and List using `@vue/test-utils` `mount`. Always pass every required prop, including `sortOrder` and `loading` — a prior spec shipped without a required prop and passed anyway (architecture report #13); don't repeat that.
   - Page spec in `app/pages/<feature>/__tests__/`: mock `#app/composables/asyncData`'s `useAsyncData` and the feature composable, following `app/pages/one-new/__tests__/index.spec.ts`. The `workout` page currently has no test at all (architecture report #13) — don't leave the new feature's page untested either.
7. **Verify**: run `npm run test` and `npm run lint`; fix failures before finishing.
8. **Docs**: check whether AGENTS.md's project overview or structure section needs a one-line addition for the new feature.

## Non-goals

- Does not refactor `useDailyNew` / `useTopics` / `useWorkout` into a shared factory (a separate architectural decision — see `docs/reports/2026-07-06-architecture.md` improvement #1). Generate the duplicated-but-consistent shape; don't invent a shared abstraction unasked.
- Does not touch the Supabase schema directly — delegates to `supabase-migration`.
