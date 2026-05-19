import pg from 'pg';
import { buildPgSslConfig } from '../db/ssl.js';

const { Pool } = pg;

const SLOW_QUERY_MS = Number(process.env.PERF_SLOW_QUERY_MS) || 200;

function logSlow(text, ms) {
  if (ms < SLOW_QUERY_MS) return;
  const snippet = String(text).replace(/\s+/g, ' ').slice(0, 160);
  console.warn(`[baeu][pg] slow ${ms.toFixed(1)}ms: ${snippet}`);
}

export function createPgStore({ connectionString }) {
  const pool = new Pool({
    connectionString,
    ssl: buildPgSslConfig(connectionString, { requireInProduction: true, label: 'pgStore' }),
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  // Wrap pool.query so every roundtrip is timed and slow ones are logged.
  const rawQuery = pool.query.bind(pool);
  pool.query = (text, params) => {
    const start = process.hrtime.bigint();
    const p = rawQuery(text, params);
    p.then(
      () => logSlow(typeof text === 'string' ? text : text?.text || '', Number(process.hrtime.bigint() - start) / 1e6),
      () => {}
    );
    return p;
  };

  const q = (text, params) => pool.query(text, params);
  const one = async (text, params) => (await pool.query(text, params)).rows[0] || null;
  const all = async (text, params) => (await pool.query(text, params)).rows;

  return {
    __mode: 'pg',
    pool,

    async end() {
      await pool.end();
    },

    // user roles — Better Auth owns the `user` table. Application-level role
    // lives in `user_role` keyed by the Better Auth text user id.
    async getUserRole(userId) {
      const row = await one(
        'select role from user_role where user_id = $1',
        [userId]
      );
      return row?.role || 'user';
    },
    async setUserRole(userId, role) {
      if (!['user', 'admin'].includes(role)) {
        throw new Error('invalid_role');
      }
      const row = await one(
        `insert into user_role (user_id, role) values ($1, $2)
         on conflict (user_id) do update set role = excluded.role
         returning *`,
        [userId, role]
      );
      return row;
    },

    // exercises
    listPublishedExercises: ({ moduleId = null } = {}) =>
      moduleId
        ? all(`select * from exercises where status = 'published' and module_id = $1`, [moduleId])
        : all(`select * from exercises where status = 'published'`),
    countPublishedByModule: async () => {
      const rows = await all(
        `select coalesce(module_id::text, '__none__') as k, count(*)::int as n
           from exercises where status = 'published'
          group by 1`
      );
      const out = {};
      for (const r of rows) out[r.k] = r.n;
      return out;
    },

    // modules
    listModules: () => all('select * from modules order by order_index asc, title asc'),
    getModuleBySlug: (slug) => one('select * from modules where slug = $1', [slug]),
    getModuleById: (id) => one('select * from modules where id = $1', [id]),
    upsertModule: (row) =>
      one(
        `insert into modules (slug, title, description, order_index, icon)
         values ($1,$2,$3,$4,$5)
         on conflict (slug) do update set
           title = excluded.title,
           description = excluded.description,
           order_index = excluded.order_index,
           icon = excluded.icon
         returning *`,
        [row.slug, row.title, row.description || '', row.order_index ?? 0, row.icon || null]
      ),
    listAllExercises: () => all(`select * from exercises order by created_at desc limit 500`),
    listExercisesByStatus: (status) =>
      status
        ? all(`select * from exercises where status = $1 order by created_at desc limit 500`, [status])
        : all(`select * from exercises order by created_at desc limit 500`),
    updateExerciseStatus: (id, status) =>
      one(`update exercises set status = $2 where id = $1 returning *`, [id, status]),
    getExercise: (id) => one('select * from exercises where id = $1', [id]),

    async insertExercises(rows) {
      if (!rows.length) return [];
      const created = [];
      const client = await pool.connect();
      try {
        await client.query('begin');
        for (const r of rows) {
          const res = await client.query(
            `insert into exercises (
               module_id, lesson_id, type, difficulty, prompt, prompt_locale, options,
               correct_answer, accepted_answers, explanation, skill_tags,
               metadata, status, source, created_by
             ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
             returning *`,
            [
              r.module_id || null,
              r.lesson_id || null,
              r.type,
              r.difficulty || 'easy',
              r.prompt,
              r.prompt_locale || 'en',
              JSON.stringify(r.options || []),
              r.correct_answer ?? null,
              JSON.stringify(r.accepted_answers || []),
              r.explanation || '',
              JSON.stringify(r.skill_tags || []),
              JSON.stringify(r.metadata || {}),
              r.status || 'draft',
              r.source || 'import',
              r.created_by || null,
            ]
          );
          created.push(res.rows[0]);
        }
        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        throw err;
      } finally {
        client.release();
      }
      return created;
    },

    // distinct skills user has mastery for, restricted to a module's skill tag set
    async countMasteredSkillsInModule(userId, moduleId) {
      const row = await one(
        `select count(distinct m.skill)::int as n
           from user_skill_mastery m
          where m.user_id = $1
            and exists (
              select 1 from exercises e
               where e.module_id = $2
                 and e.skill_tags @> jsonb_build_array(m.skill)
            )`,
        [userId, moduleId]
      );
      return row?.n || 0;
    },

    // sessions
    createSession: ({ user_id, mode = 'endless' }) =>
      one(
        `insert into practice_sessions (user_id, mode) values ($1, $2) returning *`,
        [user_id, mode]
      ),
    getSession: (id) => one('select * from practice_sessions where id = $1', [id]),
    incrementSession: (id, { correct }) =>
      one(
        `update practice_sessions
            set total_attempts = total_attempts + 1,
                correct_attempts = correct_attempts + $2
          where id = $1
          returning *`,
        [id, correct ? 1 : 0]
      ),

    // attempts
    insertAttempt: (row) =>
      one(
        `insert into practice_attempts (
            session_id, user_id, exercise_id, answer, correct,
            response_ms, error_tags, skill_tags
         ) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
        [
          row.session_id,
          row.user_id,
          row.exercise_id,
          row.answer,
          row.correct,
          row.response_ms ?? null,
          JSON.stringify(row.error_tags || []),
          JSON.stringify(row.skill_tags || []),
        ]
      ),
    listAttemptsForSession: (sessionId) =>
      all(
        'select * from practice_attempts where session_id = $1 order by created_at asc',
        [sessionId]
      ),
    listAttemptsForUser: (userId, { limit = 200 } = {}) =>
      all(
        `select * from practice_attempts
          where user_id = $1
          order by created_at desc
          limit $2`,
        [userId, limit]
      ),
    // Analytics helpers (admin-only). Bounded by `since` to avoid scanning
    // the whole table once attempts grow.
    async listAttemptsSince({ since, limit = 50_000 } = {}) {
      const cutoff = since instanceof Date ? since.toISOString() : since;
      return all(
        `select id, user_id, exercise_id, correct, response_ms, error_tags, skill_tags, created_at
           from practice_attempts
          where created_at >= $1
          order by created_at asc
          limit $2`,
        [cutoff, limit]
      );
    },
    async exerciseStatsSince({ since, limit = 200 } = {}) {
      const cutoff = since instanceof Date ? since.toISOString() : since;
      return all(
        `select
           e.id as exercise_id,
           e.prompt,
           e.type,
           e.module_id,
           m.slug as module_slug,
           count(a.id)::int as attempts,
           sum(case when a.correct then 1 else 0 end)::int as correct,
           avg(a.response_ms)::float as avg_response_ms
         from practice_attempts a
         join exercises e on e.id = a.exercise_id
         left join modules m on m.id = e.module_id
         where a.created_at >= $1
         group by e.id, e.prompt, e.type, e.module_id, m.slug
         having count(a.id) >= 3
         order by count(a.id) desc
         limit $2`,
        [cutoff, limit]
      );
    },
    listRecentAttemptsAdmin: ({ wrongOnly = false, limit = 50 } = {}) =>
      wrongOnly
        ? all(
            `select * from practice_attempts where correct = false
             order by created_at desc limit $1`,
            [limit]
          )
        : all(
            `select * from practice_attempts
             order by created_at desc limit $1`,
            [limit]
          ),

    // mastery
    getMasteryForUser: (userId) =>
      all('select * from user_skill_mastery where user_id = $1', [userId]),
    getMastery: (userId, skill) =>
      one(
        'select * from user_skill_mastery where user_id = $1 and skill = $2',
        [userId, skill]
      ),
    upsertMastery: (row) =>
      one(
        `insert into user_skill_mastery
          (user_id, skill, level, streak, total_attempts, total_correct,
           last_seen_at, last_correct_at, next_review_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (user_id, skill) do update set
           level = excluded.level,
           streak = excluded.streak,
           total_attempts = excluded.total_attempts,
           total_correct = excluded.total_correct,
           last_seen_at = excluded.last_seen_at,
           last_correct_at = excluded.last_correct_at,
           next_review_at = excluded.next_review_at
         returning *`,
        [
          row.user_id,
          row.skill,
          row.level,
          row.streak,
          row.total_attempts,
          row.total_correct,
          row.last_seen_at,
          row.last_correct_at,
          row.next_review_at,
        ]
      ),

    // grammar lessons
    listLessons: ({ moduleId = null } = {}) =>
      moduleId
        ? all(
            'select * from grammar_lessons where module_id = $1 order by order_index asc, title asc',
            [moduleId]
          )
        : all('select * from grammar_lessons order by order_index asc, title asc'),
    getLessonBySlug: (slug) => one('select * from grammar_lessons where slug = $1', [slug]),
    upsertLesson: (row) =>
      one(
        `insert into grammar_lessons
          (slug, module_id, title, summary, body_md, related_error_tags, related_skill_tags, order_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (slug) do update set
           module_id = excluded.module_id,
           title = excluded.title,
           summary = excluded.summary,
           body_md = excluded.body_md,
           related_error_tags = excluded.related_error_tags,
           related_skill_tags = excluded.related_skill_tags,
           order_index = excluded.order_index
         returning *`,
        [
          row.slug,
          row.module_id || null,
          row.title,
          row.summary || '',
          row.body_md,
          JSON.stringify(row.related_error_tags || []),
          JSON.stringify(row.related_skill_tags || []),
          row.order_index ?? 0,
        ]
      ),
    findLessonForErrorTag: (errorTag) =>
      one(
        `select * from grammar_lessons
          where related_error_tags @> $1::jsonb
          order by order_index asc limit 1`,
        [JSON.stringify([errorTag])]
      ),
  };
}
