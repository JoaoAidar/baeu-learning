// Exercise selection. Three signals composed:
//   1. mastery: prefer due skills, prefer lowest level
//   2. recent errors: weight skills the user has missed
//   3. variety: avoid repeating last 3 types and same-session items
//
// focus='weak' tightens to skills with recent errors.

export function selectNext({
  exercises,
  recentAttempts = [],
  sessionAttempts = [],
  masteryMap = new Map(),
  focus = null,
}) {
  if (!exercises.length) return null;

  const now = Date.now();
  const seen = new Set(sessionAttempts.map((a) => a.exercise_id));
  let candidates = exercises.filter((e) => !seen.has(e.id));
  if (!candidates.length) candidates = exercises;

  if (focus === 'weak') {
    // "Weak" = recently missed OR weak by mastery (low level / due for review).
    // The second source matches the Progress "what to work on" panel, so the
    // Drill CTA targets the same skills the diagnostic surfaced — not only the
    // last few mistakes.
    const set = new Set(computeWeakSkills(recentAttempts).map((w) => w.skill));
    for (const [skill, m] of masteryMap.entries()) {
      if (m.level >= 5) continue;
      const dueAt = m.next_review_at ? new Date(m.next_review_at).getTime() : 0;
      if (m.level <= 1 || dueAt <= now) set.add(skill);
    }
    if (set.size) {
      const filtered = candidates.filter((ex) =>
        (ex.skill_tags || []).some((t) => set.has(t))
      );
      if (filtered.length) candidates = filtered;
    }
  }

  const skillErrorCounts = new Map();
  for (const a of recentAttempts) {
    if (a.correct) continue;
    for (const s of a.skill_tags || []) {
      skillErrorCounts.set(s, (skillErrorCounts.get(s) || 0) + 1);
    }
  }
  const practiceCounts = new Map();
  for (const a of recentAttempts) {
    for (const s of a.skill_tags || []) {
      practiceCounts.set(s, (practiceCounts.get(s) || 0) + 1);
    }
  }

  const lastTypes = sessionAttempts.slice(-3).map((a) => {
    const ex = exercises.find((e) => e.id === a.exercise_id);
    return ex?.type;
  });

  const weakBoost = focus === 'weak' ? 4 : 2;

  const scored = candidates.map((ex) => {
    let score = Math.random() * 0.5;
    const tags = ex.skill_tags || [];

    for (const t of tags) {
      // recent-error signal
      score += (skillErrorCounts.get(t) || 0) * weakBoost;

      // under-practiced bonus
      if ((practiceCounts.get(t) || 0) < 3) score += 1;

      // mastery signal
      const m = masteryMap.get(t);
      if (!m) {
        score += 1.2; // never seen this skill — small boost
      } else if (m.level >= 5) {
        // Mastered: bury it while fresh, but resurface once due so long-term
        // retention is actually checked (spaced repetition, not "done forever").
        const dueAt = m.next_review_at ? new Date(m.next_review_at).getTime() : 0;
        if (dueAt <= now) score += 1;
        else score -= 1.5;
      } else {
        const dueAt = m.next_review_at ? new Date(m.next_review_at).getTime() : 0;
        if (dueAt <= now) score += 2 + (5 - m.level) * 0.4; // due, lower level → more
        else score -= 0.5; // not due
      }
    }

    if (lastTypes.includes(ex.type)) score -= 0.7;
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].ex;
}

export function computeWeakSkills(attempts, { topN = 3 } = {}) {
  const counts = new Map();
  for (const a of attempts) {
    if (a.correct) continue;
    for (const s of a.skill_tags || []) counts.set(s, (counts.get(s) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([skill, count]) => ({ skill, count }));
}
