import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

const LEVEL_LABELS = ['New', 'Seen', 'Practicing', 'Familiar', 'Strong', 'Mastered'];
const LEVEL_COLORS = [
  'bg-gray-300',
  'bg-blue-300',
  'bg-blue-500',
  'bg-secondary-500',
  'bg-green-500',
  'bg-green-600',
];

export default function Progress() {
  const [overview, setOverview] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.progressOverview(), api.progressSkills()])
      .then(([o, s]) => { if (!cancelled) { setOverview(o); setSkills(s.skills || []); } })
      .catch((e) => !cancelled && toast.push(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto text-gray-500 text-center py-12">Loading…</div>;
  }
  if (!overview) return null;

  const acc = Math.round((overview.totals.accuracy || 0) * 100);
  const acc7 = Math.round((overview.last7Days.accuracy || 0) * 100);
  const dueCount = skills.filter((s) => s.due && s.level < 5).length;
  const masteredCount = skills.filter((s) => s.level >= 5).length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Streak" value={`${overview.streakDays}d`} accent />
        <Stat label="Total" value={overview.totals.attempts} />
        <Stat label="Accuracy" value={`${acc}%`} />
        <Stat label="Last 7d" value={`${overview.last7Days.attempts}`} sub={`${acc7}%`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Skills due" value={dueCount} accent={dueCount > 0} />
        <Stat label="Mastered" value={masteredCount} />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">Skills</h3>
        {skills.length === 0 ? (
          <p className="text-gray-500 text-sm">No skill data yet — answer a few questions first.</p>
        ) : (
          <div className="space-y-3">
            {skills.map((s) => <SkillRow key={s.skill} skill={s} />)}
          </div>
        )}
      </div>

      {Object.keys(overview.errorTagCounts).length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">
            Error breakdown
            <span className="text-gray-400 text-sm font-normal ml-2">all-time</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(overview.errorTagCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  {t} · {n}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-xl shadow-card border p-4 ${accent ? 'border-primary-200' : 'border-gray-100'}`}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-heading text-3xl font-bold text-gray-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SkillRow({ skill }) {
  const pct = (skill.level / 5) * 100;
  const acc = Math.round(skill.accuracy * 100);
  const color = LEVEL_COLORS[skill.level] || 'bg-gray-300';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <strong className="text-gray-900">{skill.skill}</strong>
          <span className="text-xs text-gray-500">{LEVEL_LABELS[skill.level]}</span>
          {skill.due && skill.level < 5 && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-primary-100 text-primary-700 font-medium">
              due
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {skill.totalCorrect}/{skill.totalAttempts} · {acc}%
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
