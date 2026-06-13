// Per-item spaced repetition wiring. The *scheduling math* now lives in the
// pure, fleet-portable `lib/srs` module (SM-2-lite, zero I/O); this service is
// only the persistence/degradation layer around it.
//
// This complements MasteryService (per-skill diagnostic). Mastery answers
// "how is this skill?", SRS answers "when should this exercise come back?".

import { getStore } from '../config/db.js';
import { nextSrsState, MIN_EASE, DEFAULT_EASE } from '../lib/srs/index.js';

// Re-export the pure transition so existing callers/tests keep importing it
// from here while the math is owned by the standalone lib.
export { nextSrsState };

let srsUnavailableLogged = false;

// SRS is an enhancement, never a hard dependency. If the table is missing
// (migration not yet run) or any SRS query fails, degrade to a no-op so the
// practice loop keeps working on skill signals alone.
function noteUnavailable(err) {
  if (!srsUnavailableLogged) {
    srsUnavailableLogged = true;
    console.warn(`[baeu][srs] disabled (run \`npm run migrate\`): ${err?.message || err}`);
  }
}

export async function recordReview({ userId, exerciseId, correct }) {
  if (!exerciseId) return null;
  const store = getStore();
  if (!store.getSrs) return null; // store without SRS support — no-op
  try {
    const prev = await store.getSrs(userId, exerciseId);
    const next = nextSrsState(prev, correct);
    return await store.upsertSrs({ user_id: userId, exercise_id: exerciseId, ...next });
  } catch (err) {
    noteUnavailable(err);
    return null;
  }
}

export async function getSrsMap(userId) {
  const store = getStore();
  if (!store.getSrsForUser) return new Map();
  try {
    const rows = await store.getSrsForUser(userId);
    const map = new Map();
    for (const r of rows) map.set(r.exercise_id, r);
    return map;
  } catch (err) {
    noteUnavailable(err);
    return new Map();
  }
}

export const _internals = { MIN_EASE, DEFAULT_EASE };
