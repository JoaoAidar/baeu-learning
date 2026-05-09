-- Baeu Learning schema (Neon Postgres). Idempotent.

create extension if not exists pgcrypto;

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  order_index integer not null default 0,
  icon text,
  created_at timestamptz default now()
);

create index if not exists modules_order_idx on modules(order_index);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now()
);

create index if not exists users_email_idx on users(lower(email));

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete set null,
  lesson_id uuid references lessons(id) on delete set null,
  type text not null check (type in ('multiple_choice','translation','fill_blank','listening')),
  difficulty text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  prompt text not null,
  prompt_locale text not null default 'en',
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  accepted_answers jsonb not null default '[]'::jsonb,
  explanation text,
  skill_tags jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  source text not null default 'manual' check (source in ('manual','import','generated')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- ensure module_id exists on upgrades from older schema (must run before index)
alter table exercises add column if not exists module_id uuid references modules(id) on delete set null;

create index if not exists exercises_status_idx on exercises(status);
create index if not exists exercises_module_idx on exercises(module_id);
create index if not exists exercises_skill_tags_idx on exercises using gin (skill_tags);

create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mode text not null default 'endless',
  started_at timestamptz default now(),
  ended_at timestamptz,
  total_attempts integer not null default 0,
  correct_attempts integer not null default 0
);

create index if not exists practice_sessions_user_idx on practice_sessions(user_id);

create table if not exists practice_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references practice_sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  answer text,
  correct boolean not null,
  response_ms integer,
  error_tags jsonb not null default '[]'::jsonb,
  skill_tags jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists practice_attempts_session_idx on practice_attempts(session_id);
create index if not exists practice_attempts_user_idx on practice_attempts(user_id);
create index if not exists practice_attempts_error_tags_idx on practice_attempts using gin (error_tags);
create index if not exists practice_attempts_created_idx on practice_attempts(user_id, created_at desc);

create table if not exists user_skill_mastery (
  user_id uuid not null references users(id) on delete cascade,
  skill text not null,
  level integer not null default 0 check (level between 0 and 5),
  streak integer not null default 0,
  total_attempts integer not null default 0,
  total_correct integer not null default 0,
  last_seen_at timestamptz default now(),
  last_correct_at timestamptz,
  next_review_at timestamptz default now(),
  primary key (user_id, skill)
);

create index if not exists user_skill_mastery_due_idx
  on user_skill_mastery(user_id, next_review_at);

create table if not exists grammar_lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  module_id uuid references modules(id) on delete set null,
  title text not null,
  summary text not null default '',
  body_md text not null,
  related_error_tags jsonb not null default '[]'::jsonb,
  related_skill_tags jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists grammar_lessons_module_idx on grammar_lessons(module_id);
create index if not exists grammar_lessons_error_tags_idx on grammar_lessons using gin (related_error_tags);
