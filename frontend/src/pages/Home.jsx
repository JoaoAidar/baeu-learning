import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Home() {
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [overview, setOverview] = useState(null);
  const [skills, setSkills] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCoachmark, setShowCoachmark] = useState(() => {
    try {
      return typeof window !== 'undefined' && !window.localStorage.getItem('baeu_seen_home');
    } catch {
      return false;
    }
  });
  const toast = useToast();

  useEffect(() => {
    try {
      window.localStorage.setItem('baeu_seen_home', '1');
    } catch {
      /* ignore */
    }
  }, []);

  function dismissCoachmark() {
    setShowCoachmark(false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.modulesList(),
      api.progressOverview().catch(() => null),
      api.progressSkills().catch(() => ({ skills: [] })),
      api.results(30).catch(() => null),
    ])
      .then(([r, progress, skillRows, resultSignals]) => {
        if (cancelled) return;
        setModules(r.modules || []);
        setTotal(r.total_published || 0);
        setOverview(progress);
        setSkills(skillRows?.skills || []);
        setAnalytics(resultSignals);
      })
      .catch((e) => !cancelled && toast.push(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TodayPanel
        loading={loading}
        modules={modules}
        total={total}
        overview={overview}
        skills={skills}
        analytics={analytics}
      />

      {showCoachmark && (
        <div
          data-testid="home-coachmark"
          className="relative bg-secondary-50 border border-secondary-200 rounded-xl px-5 py-4 pr-12 text-sm text-gray-800"
        >
          <p>
            <span className="font-semibold">New here?</span> Try{' '}
            <span className="font-semibold">Hangul &amp; Reading</span> first — it
            builds the alphabet you'll need for everything else.
          </p>
          <button
            type="button"
            onClick={dismissCoachmark}
            aria-label="Dismiss tip"
            className="absolute top-1 right-1 w-11 h-11 rounded-md text-gray-500 hover:text-gray-800 hover:bg-white/60 bg-transparent flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      <section>
        <h3 className="font-heading text-lg font-bold text-gray-900 mb-3 px-1">
          Modules
        </h3>
        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading…</p>
        ) : modules.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No modules yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modules.map((m) => <ModuleCard key={m.slug} m={m} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function TodayPanel({ loading, modules, total, overview, skills, analytics }) {
  const attempts = overview?.totals?.attempts || 0;
  const dueNow = analytics?.forecast?.dueNow ?? skills.filter((s) => s.due && s.level < 5).length;
  const weakSkill = rankFocusSkills(skills)[0] || null;
  const firstModule = modules.find((m) => m.exercise_count > 0) || modules[0] || null;
  const isFresh = !loading && attempts === 0;
  const isDone = !loading && attempts > 0 && dueNow === 0 && !weakSkill;

  let title = 'Today';
  let body = 'Load your review queue, weak skills, and next module.';
  let primaryHref = '#/practice';
  let primaryLabel = 'Start practice';
  let secondaryHref = firstModule ? `#/module/${firstModule.slug}` : '#/progress';
  let secondaryLabel = firstModule ? 'Browse modules' : 'View progress';

  if (loading) {
    title = 'Today';
    body = 'Checking your review queue...';
  } else if (isFresh) {
    title = 'Start with Hangul';
    body = firstModule
      ? `${firstModule.title} is the cleanest first step. Get one corrected card, then your progress starts tracking.`
      : 'Answer one card to start building your review schedule.';
    primaryHref = firstModule ? `#/module/${firstModule.slug}` : '#/practice';
    primaryLabel = firstModule ? `Start ${firstModule.title}` : 'Start practice';
    secondaryHref = '#/practice';
    secondaryLabel = 'Mixed practice';
  } else if (dueNow > 0) {
    title = `${dueNow} due now`;
    body = 'Clear the review queue first. This is the work that keeps spaced repetition honest.';
    primaryHref = '#/practice?focus=weak';
    primaryLabel = 'Review due cards';
    secondaryHref = '#/progress';
    secondaryLabel = 'Inspect progress';
  } else if (weakSkill) {
    title = `Drill ${labelFor(weakSkill.skill)}`;
    body = `${accuracyLabel(weakSkill)} needs the next rep. Keep it focused instead of opening a generic session.`;
    primaryHref = '#/practice?focus=weak';
    primaryLabel = 'Drill weak area';
    secondaryHref = '#/results';
    secondaryLabel = 'See signals';
  } else if (isDone) {
    title = 'Done for now';
    body = 'No due cards or weak-skill queue is waiting. A short mixed round is optional.';
    primaryHref = '#/practice';
    primaryLabel = 'Optional mixed practice';
    secondaryHref = '#/results';
    secondaryLabel = 'Review results';
  }

  return (
    <section className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8" data-testid="today-panel">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-2">
            Today's Korean
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
            {body}
          </p>
          {!loading && total > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {total} questions across {modules.length} modules.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
          <a
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-card hover:shadow-card-hover whitespace-nowrap no-underline"
          >
            {primaryLabel}
            <span aria-hidden>→</span>
          </a>
          <a
            href={secondaryHref}
            className="inline-flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-card hover:shadow-card-hover whitespace-nowrap no-underline"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <TodayMetric label="Due now" value={loading ? '...' : dueNow} accent={dueNow > 0} />
        <TodayMetric label="Attempts" value={loading ? '...' : attempts} />
        <TodayMetric label="Weak focus" value={loading ? '...' : weakSkill ? labelFor(weakSkill.skill) : 'clear'} />
      </div>
    </section>
  );
}

function TodayMetric({ label, value, accent = false }) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${accent ? 'border-primary-200 bg-primary-50' : 'border-gray-100 bg-gray-50'}`}>
      <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{label}</div>
      <div className="font-heading text-lg font-bold text-gray-900 truncate">{value}</div>
    </div>
  );
}

function effectiveAccuracy(s) {
  return s.recentAttempts > 0 ? s.recentAccuracy : s.accuracy;
}

function rankFocusSkills(skills) {
  return (skills || [])
    .map((s) => ({ ...s, _acc: effectiveAccuracy(s) }))
    .filter((s) => s.level < 5 && s.totalAttempts > 0 && (s.due || s._acc < 0.7))
    .map((s) => ({
      ...s,
      _score: (1 - (s._acc || 0)) * 2 + (5 - s.level) * 0.3 + (s.due ? 1 : 0),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 3);
}

function accuracyLabel(skill) {
  const acc = Math.round((skill._acc || 0) * 100);
  return `${acc}%${skill.recentAttempts > 0 ? ' recent' : ''}`;
}

function labelFor(raw) {
  return String(raw || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function ModuleCard({ m }) {
  const empty = m.exercise_count === 0;
  return (
    <a
      href={`#/module/${m.slug}`}
      className={`block bg-white rounded-xl border p-5 transition-all no-underline group ${
        empty
          ? 'border-gray-100 opacity-60'
          : 'border-gray-100 hover:border-primary-300 hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-secondary-50 text-secondary-700 font-heading font-bold text-lg flex items-center justify-center flex-shrink-0">
          {m.icon || '·'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-heading text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {m.title}
            </h4>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {m.exercise_count} q
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.description}</p>
        </div>
      </div>
    </a>
  );
}
