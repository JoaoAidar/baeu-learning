import { randomUUID } from 'node:crypto';

const store = {
  users: new Map(), // dev-only convenience; Better Auth owns auth in prod.
  userRoles: new Map(), // user_id -> 'user' | 'admin'
  modules: new Map(),
  exercises: new Map(),
  sessions: new Map(),
  attempts: [],
  mastery: new Map(), // key = `${user_id}::${skill}`
  lessons: new Map(),
};

export const memoryStore = {
  __mode: 'memory',

  reset() {
    store.users.clear();
    store.userRoles.clear();
    store.modules.clear();
    store.exercises.clear();
    store.sessions.clear();
    store.attempts.length = 0;
    store.mastery.clear();
    store.lessons.clear();
  },

  // user roles — application-side authorization. Keyed by Better Auth user id
  // string (or any opaque string id passed by tests).
  async getUserRole(userId) {
    return store.userRoles.get(userId) || 'user';
  },
  async setUserRole(userId, role) {
    if (!['user', 'admin'].includes(role)) throw new Error('invalid_role');
    store.userRoles.set(userId, role);
    return { user_id: userId, role };
  },

  // grammar lessons
  async listLessons({ moduleId = null } = {}) {
    const all = [...store.lessons.values()];
    const filtered = moduleId ? all.filter((l) => l.module_id === moduleId) : all;
    return filtered.sort((a, b) => a.order_index - b.order_index);
  },
  async getLessonBySlug(slug) {
    for (const l of store.lessons.values()) if (l.slug === slug) return l;
    return null;
  },
  async upsertLesson(row) {
    const existing = await this.getLessonBySlug(row.slug);
    const id = existing?.id || randomUUID();
    const record = {
      id,
      slug: row.slug,
      module_id: row.module_id || null,
      title: row.title,
      summary: row.summary || '',
      body_md: row.body_md,
      related_error_tags: row.related_error_tags || [],
      related_skill_tags: row.related_skill_tags || [],
      order_index: row.order_index ?? 0,
      created_at: existing?.created_at || new Date().toISOString(),
    };
    store.lessons.set(id, record);
    return record;
  },
  async findLessonForErrorTag(errorTag) {
    for (const l of store.lessons.values()) {
      if ((l.related_error_tags || []).includes(errorTag)) return l;
    }
    return null;
  },

  // modules
  async listModules() {
    return [...store.modules.values()].sort((a, b) => a.order_index - b.order_index);
  },
  async getModuleBySlug(slug) {
    for (const m of store.modules.values()) if (m.slug === slug) return m;
    return null;
  },
  async getModuleById(id) {
    return store.modules.get(id) || null;
  },
  async upsertModule(row) {
    const existing = await this.getModuleBySlug(row.slug);
    const id = existing?.id || randomUUID();
    const record = {
      id,
      slug: row.slug,
      title: row.title,
      description: row.description || '',
      order_index: row.order_index ?? 0,
      icon: row.icon || null,
      created_at: existing?.created_at || new Date().toISOString(),
    };
    store.modules.set(id, record);
    return record;
  },

  // users — dev-only convenience. Better Auth owns the real user table in
  // Postgres. Tests use these helpers to stand up users without going through
  // the auth router. Roles live in store.userRoles (see getUserRole above).
  async getUserByEmail(email) {
    const norm = String(email).trim().toLowerCase();
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === norm) return u;
    }
    return null;
  },
  async getUserById(id) {
    return store.users.get(id) || null;
  },
  async createUser({ id: forcedId, email, display_name, role = 'user' } = {}) {
    const id = forcedId || randomUUID();
    const user = {
      id,
      email: email || `user-${id}@test.local`,
      display_name: display_name || null,
      created_at: new Date().toISOString(),
    };
    store.users.set(id, user);
    if (role && role !== 'user') store.userRoles.set(id, role);
    return user;
  },
  async countMasteredSkillsInModule(userId, moduleId) {
    // collect skill tags for this module's exercises
    const modSkills = new Set();
    for (const e of store.exercises.values()) {
      if (e.module_id !== moduleId) continue;
      for (const t of e.skill_tags || []) modSkills.add(t);
    }
    let n = 0;
    for (const m of store.mastery.values()) {
      if (m.user_id !== userId) continue;
      if (modSkills.has(m.skill)) n += 1;
    }
    return n;
  },

  // exercises
  async listPublishedExercises({ moduleId = null } = {}) {
    return [...store.exercises.values()].filter((e) => {
      if (e.status !== 'published') return false;
      if (moduleId && e.module_id !== moduleId) return false;
      return true;
    });
  },
  async countPublishedByModule() {
    const counts = {};
    for (const e of store.exercises.values()) {
      if (e.status !== 'published') continue;
      const k = e.module_id || '__none__';
      counts[k] = (counts[k] || 0) + 1;
    }
    return counts;
  },
  async listAllExercises() {
    return [...store.exercises.values()];
  },
  async listExercisesByStatus(status) {
    const all = [...store.exercises.values()];
    return status ? all.filter((e) => e.status === status) : all;
  },
  async updateExerciseStatus(id, status) {
    const e = store.exercises.get(id);
    if (!e) return null;
    e.status = status;
    return e;
  },
  async getExercise(id) {
    return store.exercises.get(id) || null;
  },
  async insertExercises(rows) {
    const created = [];
    for (const row of rows) {
      const id = row.id || randomUUID();
      const record = {
        id,
        module_id: row.module_id || null,
        lesson_id: row.lesson_id || null,
        type: row.type,
        difficulty: row.difficulty || 'easy',
        prompt: row.prompt,
        prompt_locale: row.prompt_locale || 'en',
        options: row.options || [],
        correct_answer: row.correct_answer ?? null,
        accepted_answers: row.accepted_answers || [],
        explanation: row.explanation || '',
        skill_tags: row.skill_tags || [],
        metadata: row.metadata || {},
        status: row.status || 'draft',
        source: row.source || 'import',
        created_by: row.created_by || null,
        created_at: new Date().toISOString(),
      };
      store.exercises.set(id, record);
      created.push(record);
    }
    return created;
  },

  // sessions
  async createSession({ user_id, mode = 'endless' }) {
    const id = randomUUID();
    const session = {
      id,
      user_id,
      mode,
      started_at: new Date().toISOString(),
      ended_at: null,
      total_attempts: 0,
      correct_attempts: 0,
    };
    store.sessions.set(id, session);
    return session;
  },
  async getSession(id) {
    return store.sessions.get(id) || null;
  },
  async incrementSession(id, { correct }) {
    const s = store.sessions.get(id);
    if (!s) return null;
    s.total_attempts += 1;
    if (correct) s.correct_attempts += 1;
    return s;
  },

  // attempts
  async insertAttempt(row) {
    // Mirror the partial unique index from schema.sql:
    //   practice_attempts_idem_idx (session_id, exercise_id, response_ms)
    //   where exercise_id is not null
    // so memory-mode behaves like Postgres for double-submit guard.
    // Postgres treats NULLs as distinct in a unique index by default, so
    // only collide when response_ms is a real number AND matches an existing
    // (session_id, exercise_id, response_ms) tuple.
    if (row.exercise_id != null && row.response_ms != null) {
      const dup = store.attempts.find(
        (a) =>
          a.session_id === row.session_id &&
          a.exercise_id === row.exercise_id &&
          a.response_ms === row.response_ms
      );
      if (dup) {
        const err = new Error('duplicate_submit');
        err.code = 'duplicate_submit';
        throw err;
      }
    }
    const record = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      ...row,
    };
    store.attempts.push(record);
    return record;
  },
  async listAttemptsForSession(sessionId) {
    return store.attempts.filter((a) => a.session_id === sessionId);
  },
  async listAttemptsForUser(userId, { limit = 200 } = {}) {
    const rows = store.attempts.filter((a) => a.user_id === userId);
    return rows.slice(-limit);
  },
  async listRecentAttemptsAdmin({ wrongOnly = false, limit = 50 } = {}) {
    const rows = [...store.attempts].reverse();
    const filtered = wrongOnly ? rows.filter((a) => !a.correct) : rows;
    return filtered.slice(0, limit);
  },

  // mastery
  async getMasteryForUser(userId) {
    const out = [];
    for (const m of store.mastery.values()) {
      if (m.user_id === userId) out.push({ ...m });
    }
    return out;
  },
  async upsertMastery(row) {
    const key = `${row.user_id}::${row.skill}`;
    store.mastery.set(key, { ...row });
    return store.mastery.get(key);
  },
  async getMastery(userId, skill) {
    return store.mastery.get(`${userId}::${skill}`) || null;
  },
};
