-- Baeu Learning schema (Neon Postgres).
--
-- This file is PURELY IDEMPOTENT and SAFE to re-run on a database with real
-- data: every statement is `create ... if not exists` or an idempotent ALTER.
-- It NEVER drops tables. `npm run migrate` runs this and only this.
--
-- The one-time legacy wipe (pre-Better-Auth `users` + the uuid-keyed practice
-- tables it cascaded to) now lives in `reset-legacy.sql` and runs ONLY via the
-- explicit, guarded `npm run migrate:reset`. Do NOT reintroduce DROPs here —
-- doing so would wipe practice history on every deploy/migrate.
--
-- Order of creation (matters for FKs):
--   1. Extensions.
--   2. Module-related tables (modules, lessons, exercises, grammar_lessons).
--   3. Better Auth tables (user, session, account, verification).
--   4. user_role (FK -> "user").
--   5. Practice tables (practice_sessions, practice_attempts, user_skill_mastery,
--      user_exercise_srs) keyed by user_id text -> "user"(id).

create extension if not exists pgcrypto;

-- ============================================================================
-- 2. Module / lesson / exercise content tables.
-- ============================================================================

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
  type text not null check (type in ('multiple_choice','translation','fill_blank')),
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
  -- created_by points at the Better Auth user table (text id). Nullable.
  created_by text,
  created_at timestamptz default now()
);

alter table exercises add column if not exists module_id uuid references modules(id) on delete set null;

create index if not exists exercises_status_idx on exercises(status);
create index if not exists exercises_module_idx on exercises(module_id);
create index if not exists exercises_skill_tags_idx on exercises using gin (skill_tags);

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

-- ============================================================================
-- 3. Better Auth canonical tables (camelCase column names, text PKs).
-- Generated from inspecting better-auth@1.6.10's getMigrations output for a
-- config with emailAndPassword + google socialProvider + deleteUser.
-- Schema mirrors Better Auth defaults exactly. If you ever change the auth
-- config (add a plugin, additional user fields, etc.), regenerate via
-- `npx @better-auth/cli generate` and paste the new tables here.
-- ============================================================================

create table if not exists "user" (
  id text primary key not null,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null,
  image text,
  "createdAt" timestamptz not null default current_timestamp,
  "updatedAt" timestamptz not null default current_timestamp
);

-- Better Auth's default unique(email) is case-sensitive. This index prevents
-- Foo@example.com and foo@example.com from becoming separate accounts.
create unique index if not exists user_email_lower_uniq on "user"(lower(email));

create table if not exists "session" (
  id text primary key not null,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user"(id) on delete cascade
);

create table if not exists "account" (
  id text primary key not null,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null,
  "updatedAt" timestamptz not null
);

create table if not exists "verification" (
  id text primary key not null,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default current_timestamp,
  "updatedAt" timestamptz default current_timestamp
);

-- ============================================================================
-- 4. Application-level role table. Better Auth's core schema has no role column;
-- we keep authorization data on our side so swapping plugins won't disturb it.
-- ============================================================================

create table if not exists user_role (
  user_id text primary key references "user"(id) on delete cascade,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now()
);

-- ============================================================================
-- 5. Practice tables, keyed by user_id text -> "user"(id). Idempotent.
-- ============================================================================

create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user"(id) on delete cascade,
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
  user_id text not null references "user"(id) on delete cascade,
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
-- Snapshot the exercise type on each attempt so analytics can scope error
-- breakdowns to free-text/sentence exercises (translation/fill_blank) vs MC.
alter table practice_attempts add column if not exists exercise_type text;

-- Double-submit guard. A user submitting the same exercise to the same session
-- with the same response_ms is a double-tap. response_ms won't generally repeat
-- for legitimate retries since the selector advances to a different exercise_id,
-- so this won't false-trigger on real retries.
create unique index if not exists practice_attempts_idem_idx
  on practice_attempts(session_id, exercise_id, response_ms)
  where exercise_id is not null;

create table if not exists user_skill_mastery (
  user_id text not null references "user"(id) on delete cascade,
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

-- Per-item spaced repetition (SM-2-lite). Complements user_skill_mastery:
-- mastery is the per-skill diagnostic, this schedules WHEN each exercise is due.
create table if not exists user_exercise_srs (
  user_id text not null references "user"(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  ease real not null default 2.5,
  interval_days real not null default 0,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  due_at timestamptz not null default now(),
  last_grade integer,
  last_reviewed_at timestamptz default now(),
  primary key (user_id, exercise_id)
);

create index if not exists user_exercise_srs_due_idx
  on user_exercise_srs(user_id, due_at);

-- ============================================================================
-- 6. Idempotent migrations for existing databases. The CREATE TABLE statements
-- above carry the current shape; these ALTERs bring previously-deployed DBs
-- in line. Safe to re-run.
-- ============================================================================

-- Drop the legacy 'listening' option from exercises.type — never produced,
-- no rows in prod, no frontend renderer. Schema now reflects reality.
alter table exercises drop constraint if exists exercises_type_check;
alter table exercises add constraint exercises_type_check
  check (type in ('multiple_choice','translation','fill_blank'));

-- ============================================================================
-- 7. Conversation simulator (SNS-style chat practice). A conversation is a
-- multi-turn exchange between the learner and an LLM-driven persona; at the end
-- an evaluator stores structured semantic + syntactic feedback on the row.
-- ============================================================================

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user"(id) on delete cascade,
  persona_slug text not null,
  status text not null default 'active' check (status in ('active','ended')),
  feedback jsonb,
  created_at timestamptz default now(),
  ended_at timestamptz
);
create index if not exists conversations_user_idx on conversations(user_id, created_at desc);

create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('persona','learner')),
  content text not null,
  created_at timestamptz default now()
);
create index if not exists conversation_messages_conv_idx
  on conversation_messages(conversation_id, created_at asc);
