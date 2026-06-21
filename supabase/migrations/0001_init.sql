create table daily_new (
  id         uuid        primary key default gen_random_uuid(),
  title      text        not null,
  content    text        not null,
  created_at timestamptz not null default now()
);

create table topics (
  id         uuid        primary key default gen_random_uuid(),
  content    text        not null,
  created_at timestamptz not null default now()
);

create table workout_records (
  id         uuid        primary key default gen_random_uuid(),
  category   text        not null check (category in ('chest', 'back', 'legs')),
  menu       text        not null,
  intensity  numeric     not null,
  reps       integer     not null check (reps > 0),
  created_at timestamptz not null default now()
);
