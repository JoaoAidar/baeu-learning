-- Baeu Learning schema (Neon Postgres). Idempotent.
--
-- Order of operations (matters for FKs):
--   1. Extensions.
--   2. Drop legacy `users` table cascade — wipes practice tables that FK to it.
--   3. Module-related tables (modules, lessons, exercises, grammar_lessons).
--   4. Better Auth tables (user, session, account, verification).
--   5. user_role (FK -> "user").
--   6. Practice tables (practice_sessions, practice_attempts, user_skill_mastery)
--      re-created with user_id text -> "user"(id).
--
-- Joao confirmed no real users exist in prod — wiping legacy `users` is safe.

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. Legacy users wipe (safe per Joao). Cascade drops dependent FKs that pointed
-- at users.id, including practice_sessions, practice_attempts, user_skill_mastery.
-- ============================================================================

drop table if exists users cascade;

-- ALSO drop the practice tables explicitly. `drop ... cascade` on `users`
-- removes FK constraints that pointed at users.id, but does NOT drop the
-- practice tables themselves — so they would survive with stale `user_id uuid`
-- columns and break inserts of Better Auth's text ids. Force the recreate.
-- Safe per Joao: no real users / no real practice data.
drop table if exists practice_attempts cascade;
drop table if exists user_skill_mastery cascade;
drop table if exists practice_sessions cascade;

-- ============================================================================
-- 2. Module / lesson / exercise content tables. Unchanged.
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
-- 5. Practice tables, re-created with user_id text -> "user"(id).
-- These were dropped by the `drop table users cascade` above.
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
