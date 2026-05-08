import pg from 'pg';

const { Pool } = pg;

export function createPgStore({ connectionString }) {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=') ? undefined : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  const q = (text, params) => pool.query(text, params);
  const one = async (text, params) => (await pool.query(text, params)).rows[0] || null;
  const all = async (text, params) => (await pool.query(text, params)).rows;

  return {
    __mode: 'pg',
    pool,

    async end() {
      await pool.end();
    },

    // users
    getUserByEmail: (email) =>
      one('select * from users where lower(email) = lower($1)', [email]),
    getUserById: (id) => one('select * from users where id = $1', [id]),
    createUser: ({ email, password_hash, display_name, role = 'user' }) =>
      one(
        `insert into users (email, password_hash, display_name, role)
         values ($1, $2, $3, $4) returning *`,
        [email, password_hash, display_name || null, role]
      ),

    // exercises
    listPublishedExercises: () =>
      all(`select * from exercises where status = 'published'`),
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
               lesson_id, type, difficulty, prompt, prompt_locale, options,
               correct_answer, accepted_answers, explanation, skill_tags,
               metadata, status, source, created_by
             ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             returning *`,
            [
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
  };
}
