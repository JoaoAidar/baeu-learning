-- ⚠️ DESTRUCTIVE. One-time legacy reset, NOT part of normal migrations.
--
-- This was the pre-Better-Auth cutover: the old uuid-keyed `users` table and
-- the practice tables that FK'd to it had to be dropped so they could be
-- recreated with text user ids. It DELETES ALL PRACTICE HISTORY.
--
-- It runs only via `npm run migrate:reset` (guarded by CONFIRM_DESTRUCTIVE_RESET=1),
-- which then re-applies schema.sql to recreate everything empty. Never wire this
-- into deploy.

-- Legacy users wipe. Cascade drops dependent FKs that pointed at users.id.
drop table if exists users cascade;

-- The cascade above removes FK constraints but not the practice tables
-- themselves, so drop them explicitly to force a clean recreate from schema.sql.
drop table if exists practice_attempts cascade;
drop table if exists user_skill_mastery cascade;
drop table if exists user_exercise_srs cascade;
drop table if exists practice_sessions cascade;
