alter table daily_new enable row level security;

create policy "allow anon full access" on daily_new
  for all to anon using (true) with check (true);

alter table topics enable row level security;

create policy "allow anon full access" on topics
  for all to anon using (true) with check (true);

alter table workout_records enable row level security;

create policy "allow anon full access" on workout_records
  for all to anon using (true) with check (true);
