import { randomUUID } from 'node:crypto';

const store = {
  users: new Map(),
  exercises: new Map(),
  sessions: new Map(),
  attempts: [],
  mastery: new Map(), // key = `${user_id}::${skill}`
};

export const memoryStore = {
  __mode: 'memory',

  reset() {
    store.users.clear();
    store.exercises.clear();
    store.sessions.clear();
    store.attempts.length = 0;
    store.mastery.clear();
  },

  // users
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
  async createUser({ email, password_hash, display_name, role = 'user' }) {
    const id = randomUUID();
    const user = {
      id,
      email,
      password_hash,
      display_name: display_name || null,
      role,
      created_at: new Date().toISOString(),
    };
    store.users.set(id, user);
    return user;
  },

  // exercises
  async listPublishedExercises() {
    return [...store.exercises.values()].filter((e) => e.status === 'published');
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
