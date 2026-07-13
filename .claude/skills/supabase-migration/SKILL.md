---
name: supabase-migration
description: Creates a new Supabase migration file following this project's numbering convention, defaults to enabling Row Level Security on new tables, and produces (but does not run) the `supabase gen types` command to refresh shared/types/database.ts. Use when adding or altering a table/column, or when asked to change the database schema.
allowed-tools: Read, Write, Bash(ls supabase/migrations*), Bash(command -v supabase), Bash(supabase --version), Bash(supabase db diff*), Bash(supabase migration list*)
---

# Supabase Migration

Creates a new file under `supabase/migrations/` for a schema change in this project. Migrations are not run against Supabase from here — this skill only writes the SQL file and tells you the follow-up commands.

## Steps

1. **Number the file**: run `ls supabase/migrations/` and take the highest numeric prefix (currently `0001_init.sql`). The new file is `NNNN_<snake_case_description>.sql` with the next 4-digit number, e.g. `0002_add_workout_sets_column.sql`.
2. **Write the SQL** matching the style of `supabase/migrations/0001_init.sql`:
   - `id uuid primary key default gen_random_uuid()`
   - `created_at timestamptz not null default now()`
   - explicit `not null` on required columns, `check (...)` for value constraints (e.g. `check (category in (...))`, `check (reps > 0)`)
3. **RLS check (default: on)** — for every `create table` in the migration, append:
   ```sql
   alter table <table_name> enable row level security;
   ```
   This project currently has **no RLS on any table** while the anon key is public in the client bundle (`nuxt.config.ts` → `runtimeConfig.public.supabaseKey`), which was flagged as the top-priority security risk in `docs/reports/2026-07-06-architecture.md` (#1: unauthenticated third parties can read/write/delete every row). Only omit the `enable row level security` line if the user explicitly confirms they want to skip it for this table — don't omit it silently.
   - Enabling RLS with no policies blocks all access via the anon key by default. If the app must keep working with the anon key as-is, add an explicit permissive policy alongside it, e.g.:
     ```sql
     create policy "allow anon full access" on <table_name>
       for all using (true) with check (true);
     ```
     Ask the user which they want (deny-all now / permissive policy matching current behavior) rather than guessing.
4. **Validate locally if possible**: if `command -v supabase` succeeds, you may run `supabase db diff` or `supabase migration list` to sanity-check. If the CLI isn't installed, say so and skip validation — don't attempt to install it or connect to a remote project.
5. **Type regeneration** — per AGENTS.md, `shared/types/database.ts` must be regenerated after a schema change. This requires the user's Supabase project credentials and overwrites a checked-in file, so **present the command, don't run it**:
   ```bash
   supabase gen types typescript --project-id <project-id> > shared/types/database.ts
   ```
   (or `--local` if they run Supabase locally).
6. **Domain types** — if the schema change affects application-level fields, remind the user to update the corresponding type in `shared/types/domain.ts` (e.g. `WorkoutRecord`, `DailyNew`) to match.

## Non-goals

- Does not run `supabase db push` or otherwise apply the migration to a live project.
- Does not execute `supabase gen types` — only prints the command for the user to run with their own credentials.
