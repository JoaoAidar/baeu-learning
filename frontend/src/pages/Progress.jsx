import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const LEVEL_LABELS = ['New', 'Seen', 'Practicing', 'Familiar', 'Strong', 'Mastered'];

export default function Progress() {
  const [overview, setOverview] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.progressOverview(), api.progressSkills()])
      .then(([o, s]) => {
        if (cancelled) return;
        setOverview(o);
        setSkills(s.skills || []);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="card"><p className="muted">Loading…</p></div>;
  if (error) return <div className="card"><p style={{ color: 'var(--error)' }}>{error}</p></div>;

  const acc = Math.round((overview?.totals?.accuracy || 0) * 100);
  const acc7 = Math.round((overview?.last7Days?.accuracy || 0) * 100);
  const dueSkills = skills.filter((s) => s.due && s.level < 5).length;

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Overview</h2>
        <div className="row" style={{ gap: 32, flexWrap: 'wrap' }}>
          <Stat label="Streak" value={`${overview.streakDays}d`} />
          <Stat label="Total" value={overview.totals.attempts} />
          <Stat label="Accuracy" value={`${acc}%`} />
          <Stat label="Last 7d" value={`${overview.last7Days.attempts} (${acc7}%)`} />
          <Stat label="Due to review" value={dueSkills} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Skills</h3>
        {skills.length === 0 && <p className="muted">No skill data yet — answer a few questions first.</p>}
        {skills.map((s) => <SkillRow key={s.skill} skill={s} />)}
      </div>

      {Object.keys(overview.errorTagCounts).length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Error breakdown (all-time)</h3>
          <div>
            {Object.entries(overview.errorTagCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => (
                <span key={t} className="tag error">{t} · {n}</span>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SkillRow({ skill }) {
  const pct = (skill.level / 5) * 100;
  const acc = Math.round(skill.accuracy * 100);
  return (
    <div style={{ borderTop: '1px solid #262b34', padding: '10px 0' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <strong>{skill.skill}</strong>{' '}
          <span className="muted">· {LEVEL_LABELS[skill.level]}</span>
          {skill.due && skill.level < 5 && <span className="tag error" style={{ marginLeft: 6 }}>due</span>}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          {skill.totalCorrect}/{skill.totalAttempts} · {acc}%
        </div>
      </div>
      <div className="bar"><div style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
