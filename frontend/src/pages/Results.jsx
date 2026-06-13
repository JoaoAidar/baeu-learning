import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

// Deep learner analytics — complements /progress (which is the lightweight
// streak/skill view). Surfaces:
//   - daily attempt volume
//   - response-time trend (correct-only, so give-ups don't skew)
//   - toughest exercises (worst accuracy among items attempted ≥2x)
//   - error-tag breakdown for the chosen window
//   - mastery distribution
//
// Backed by GET /api/v1/analytics/results?days=N.
export default function Results() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .results(days)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => !cancelled && toast.push(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [days]);

  if (loading && !data) {
    return <div className="max-w-3xl mx-auto text-gray-500 text-center py-12">Loading…</div>;
  }
  if (!data) return null;

  const acc = Math.round((data.totals.accuracy || 0) * 100);
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.attempts));

  return (
    <div className="max-w-4xl mx-auto space-y-4" data-testid="results-page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-heading text-2xl font-bold text-gray-900">Your results</h2>
        <select
          data-testid="results-window"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Attempts" value={data.totals.attempts} />
        <Stat label="Correct" value={data.totals.correct} />
        <Stat label="Accuracy" value={`${acc}%`} />
        <Stat label="Tough items" value={data.toughestExercises.length} />
      </div>

      <Card title="Daily activity" subtitle={`Last ${days} days`}>
        <div className="flex items-end gap-1 h-32" data-testid="results-daily">
          {data.daily.map((d) => {
            const h = Math.max(2, (d.attempts / maxDaily) * 100);
            const accRatio = d.attempts ? d.correct / d.attempts : 0;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end" title={`${d.date}: ${d.attempts} attempts, ${d.correct} correct`}>
                <div
                  className={`w-full rounded-t ${d.attempts === 0 ? 'bg-gray-100' : accRatio >= 0.8 ? 'bg-green-500' : accRatio >= 0.5 ? 'bg-secondary-500' : 'bg-red-400'}`}
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Bar color = accuracy that day. Hover for raw counts.
        </p>
      </Card>

      {data.retention && (
        <Card title="Habit" subtitle="Consistency drives spaced repetition">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="results-retention">
            <Mini label="Active days" value={data.retention.activeDays} />
            <Mini label="Current streak" value={`${data.retention.currentStreak}d`} />
            <Mini label="Longest streak" value={`${data.retention.longestStreak}d`} />
            <Mini label="Return next day" value={pctOrDash(data.retention.d1ComebackRate)} />
          </div>
        </Card>
      )}

      <Card title="Response time" subtitle="Average ms per correct answer">
        {data.responseTimeTrend.length === 0 ? (
          <p className="text-gray-500 text-sm">No timing data yet — answer a few more cards.</p>
        ) : (
          <ResponseTrend rows={data.responseTimeTrend} />
        )}
      </Card>

      {data.responseTime && data.responseTime.count > 0 && (
        <Card
          title="Pace & automaticity"
          subtitle={`Fast = ≤${Math.round(data.responseTime.fastThresholdMs / 1000)}s`}
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Mini label="Median" value={`${(data.responseTime.medianMs / 1000).toFixed(1)}s`} />
            <Mini
              label="Avg (correct)"
              value={data.responseTime.avgCorrectMs ? `${(data.responseTime.avgCorrectMs / 1000).toFixed(1)}s` : '—'}
            />
            <Mini label="Automatic recall" value={pctOrDash(data.responseTime.automaticityRate)} />
          </div>
          <SpeedAccuracy sa={data.responseTime.speedAccuracy} />
          <p className="text-xs text-gray-500 mt-3">
            Fast + correct means the answer is becoming automatic. Fast + wrong is
            usually guessing; slow + wrong is where to slow down and review.
          </p>
        </Card>
      )}

      {data.forgetting && data.forgetting.trackedItems > 0 && (
        <Card title="Forgetting & leeches" subtitle="From your spaced-repetition schedule">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4" data-testid="results-forgetting">
            <Mini label="Tracked items" value={data.forgetting.trackedItems} />
            <Mini label="Due now" value={data.forgetting.dueNow} />
            <Mini label="In relearn" value={data.forgetting.itemsInRelearn} />
            <Mini label="Mature (≥21d)" value={data.forgetting.matureItems} />
          </div>
          {data.forgetting.leeches.length === 0 ? (
            <p className="text-gray-500 text-sm">No leeches yet — nothing you've repeatedly forgotten. 👍</p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">
                Leeches — items you keep forgetting (most lapses first):
              </p>
              <ul className="space-y-1.5" data-testid="results-leeches">
                {data.forgetting.leeches.map((l) => (
                  <li key={l.exerciseId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-600 truncate" title={l.exerciseId}>
                      #{String(l.exerciseId).slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-3 text-gray-700">
                      <span className="text-red-600 font-semibold">{l.lapses} lapses</span>
                      <span className="text-gray-400">interval {l.intervalDays}d</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      )}

      {data.responseBySkill && data.responseBySkill.length > 0 && (
        <Card title="Pace by skill" subtitle="Where recall is slow vs fluent">
          <ul className="space-y-1.5" data-testid="results-pace-by-skill">
            {data.responseBySkill.map((s) => (
              <li key={s.skill} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-700">{s.skill}</span>
                <span className="flex items-center gap-3 text-gray-600">
                  <span>{(s.avgMs / 1000).toFixed(1)}s</span>
                  <span className="text-gray-400">{Math.round(s.accuracy * 100)}% · {s.attempts} att</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Toughest exercises" subtitle="Lowest accuracy among items you've seen ≥2 times">
        {data.toughestExercises.length === 0 ? (
          <p className="text-gray-500 text-sm">Not enough repetitions yet to spot patterns.</p>
        ) : (
          <ul className="space-y-2" data-testid="results-toughest">
            {data.toughestExercises.map((e) => (
              <li key={e.exerciseId} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-600 truncate" title={e.exerciseId}>
                  #{String(e.exerciseId).slice(0, 8)}
                </span>
                <span className="flex items-center gap-3 text-gray-700">
                  <span>{e.attempts} att</span>
                  <span className={e.accuracy < 0.34 ? 'text-red-600 font-semibold' : ''}>
                    {Math.round(e.accuracy * 100)}%
                  </span>
                  <span className="text-gray-400">
                    {e.avgResponseMs ? `${Math.round(e.avgResponseMs)} ms` : '—'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Mastery distribution" subtitle="Skills by current level">
        <div className="flex gap-2" data-testid="results-mastery">
          {data.masteryByLevel.map((m) => (
            <div key={m.level} className="flex-1 text-center">
              <div className="font-heading text-xl font-bold text-gray-900">{m.count}</div>
              <div className="text-xs text-gray-500">L{m.level}</div>
            </div>
          ))}
        </div>
      </Card>

      {data.sentenceErrors && data.sentenceErrors.textAttempts > 0 && (
        <Card
          title="Sentence errors"
          subtitle={`Free-text answers · ${data.sentenceErrors.textWrong}/${data.sentenceErrors.textAttempts} missed`}
        >
          {Object.keys(data.sentenceErrors.byTag).length === 0 ? (
            <p className="text-gray-500 text-sm">No mistakes on free-text answers in this window. 👍</p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">
                Where you slip when producing Korean sentences (not multiple choice):
              </p>
              <div className="flex flex-wrap gap-1.5" data-testid="results-sentence-errors">
                {Object.entries(data.sentenceErrors.byTag)
                  .sort((a, b) => b[1] - a[1])
                  .map(([t, n]) => (
                    <span key={t} className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                      {ERROR_LABELS[t] || t} · {n}
                    </span>
                  ))}
              </div>
            </>
          )}
        </Card>
      )}

      {Object.keys(data.errorTagCounts).length > 0 && (
        <Card title="All errors (incl. multiple choice)" subtitle={`Last ${days} days`}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(data.errorTagCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  {ERROR_LABELS[t] || t} · {n}
                </span>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

const ERROR_LABELS = {
  vocabulary: 'vocabulary',
  particle: 'particles',
  word_order: 'word order',
  syntax: 'sentence construction',
  tense: 'tense',
  verb_conjugation: 'verb conjugation',
  honorific_formality: 'formality',
  hangul_reading: 'hangul reading',
  spacing: 'spacing',
  romanization_dependency: 'romanization',
  unknown: 'unclassified',
};

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-heading text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-heading text-3xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-heading text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function pctOrDash(r) {
  return r == null ? '—' : `${Math.round(r * 100)}%`;
}

function SpeedAccuracy({ sa }) {
  const cell = (label, n, cls) => (
    <div className={`rounded-lg p-3 ${cls}`}>
      <div className="font-heading text-xl font-bold">{n}</div>
      <div className="text-xs leading-tight mt-0.5">{label}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2" data-testid="results-speed-accuracy">
      {cell('Fast + correct (automatic)', sa.fastCorrect, 'bg-green-50 text-green-800')}
      {cell('Slow + correct (effortful)', sa.slowCorrect, 'bg-secondary-50 text-secondary-800')}
      {cell('Fast + wrong (guessing)', sa.fastWrong, 'bg-amber-50 text-amber-800')}
      {cell('Slow + wrong (struggling)', sa.slowWrong, 'bg-red-50 text-red-800')}
    </div>
  );
}

function ResponseTrend({ rows }) {
  const max = Math.max(...rows.map((r) => r.avgResponseMs));
  return (
    <div className="flex items-end gap-1 h-24">
      {rows.map((r) => (
        <div key={r.date} className="flex-1" title={`${r.date}: ${Math.round(r.avgResponseMs)} ms`}>
          <div
            className="w-full bg-secondary-500 rounded-t"
            style={{ height: `${Math.max(4, (r.avgResponseMs / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
