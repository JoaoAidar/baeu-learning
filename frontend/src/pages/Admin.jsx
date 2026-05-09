import React, { useEffect, useState } from 'react';
import { adminApi, adminAuth } from '../api.js';
import { useToast } from '../components/Toast.jsx';

const STATUS_ORDER = ['draft', 'published', 'archived'];

export default function Admin() {
  const [token, setToken] = useState(adminAuth.getToken() || '');
  const [authed, setAuthed] = useState(!!adminAuth.getToken());
  const [tab, setTab] = useState('content');
  const [statusFilter, setStatusFilter] = useState('draft');
  const [exercises, setExercises] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate form
  const [topic, setTopic] = useState('greetings');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('easy');
  const [autoPublish, setAutoPublish] = useState(false);

  // Import form
  const [importText, setImportText] = useState('');

  const toast = useToast();

  useEffect(() => {
    if (!authed) return;
    if (tab === 'content') loadList();
    if (tab === 'calibration') loadAttempts();
  }, [authed, statusFilter, tab]);

  function saveToken() {
    if (!token.trim()) return;
    adminAuth.set(token.trim());
    setAuthed(true);
    toast.push('Admin unlocked.', 'success');
  }
  function logout() {
    adminAuth.clear();
    setAuthed(false);
    setExercises([]);
    setRecentAttempts([]);
  }

  async function loadList() {
    setLoading(true);
    try {
      const r = await adminApi.list(statusFilter);
      setExercises(r.exercises || []);
    } catch (e) { toast.push(e.message, 'error'); }
    finally { setLoading(false); }
  }
  async function loadAttempts() {
    setLoading(true);
    try {
      const r = await adminApi.recentAttempts({ wrongOnly: true, limit: 50 });
      setRecentAttempts(r.attempts || []);
    } catch (e) { toast.push(e.message, 'error'); }
    finally { setLoading(false); }
  }

  async function runGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await adminApi.generate({
        topic,
        count: Number(count),
        difficulty,
        autoPublish,
        types: ['multiple_choice', 'translation', 'fill_blank'],
      });
      toast.push(`Generated ${r.generated}, kept ${r.created}, ${r.failed?.length || 0} failed.`, 'success');
      await loadList();
    } catch (e) { toast.push(e.message, 'error'); }
    finally { setLoading(false); }
  }

  async function runImport(e) {
    e.preventDefault();
    let parsed;
    try { parsed = JSON.parse(importText); }
    catch { return toast.push('Invalid JSON', 'error'); }
    setLoading(true);
    try {
      const r = await adminApi.importJson(parsed);
      toast.push(`Created ${r.created}, ${r.failed?.length || 0} failed.`, 'success');
      setImportText('');
      await loadList();
    } catch (e) { toast.push(e.message, 'error'); }
    finally { setLoading(false); }
  }

  async function changeStatus(id, status) {
    try {
      await adminApi.setStatus(id, status);
      await loadList();
    } catch (e) { toast.push(e.message, 'error'); }
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8 animate-fade-in">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">Admin</h2>
          <p className="text-gray-500 text-sm mb-5">Enter the admin token to manage exercises.</p>
          <input
            type="password"
            placeholder="x-admin-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveToken(); }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-3"
          />
          <button
            onClick={saveToken}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1">
          {['content', 'calibration'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                tab === t ? 'bg-primary-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'content' ? 'Content' : 'Calibration'}
            </button>
          ))}
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-primary-500 text-sm bg-transparent">
          Lock
        </button>
      </div>

      {tab === 'calibration' ? (
        <CalibrationPanel attempts={recentAttempts} loading={loading} onRefresh={loadAttempts} />
      ) : (
        <>
          <Card title="Generate via LLM">
            <form onSubmit={runGenerate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <Label>Topic</Label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="greetings, food, particles…" />
                </div>
                <div>
                  <Label>Count</Label>
                  <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(e.target.value)} />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </Select>
                </div>
                <label className="flex items-center gap-2 sm:col-span-1 sm:mt-6">
                  <input
                    type="checkbox"
                    checked={autoPublish}
                    onChange={(e) => setAutoPublish(e.target.checked)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="text-sm text-gray-700">Auto-publish</span>
                </label>
              </div>
              <button
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
              >
                {loading ? 'Generating…' : 'Generate'}
              </button>
            </form>
          </Card>

          <Card title="Import JSON">
            <form onSubmit={runImport}>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"type":"translation","prompt":"…","correct_answer":"…","skill_tags":["…"],"status":"published"}]'
                className="w-full h-36 px-4 py-3 font-mono text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-3"
              />
              <button
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
              >
                Import
              </button>
            </form>
          </Card>

          <Card
            title="Exercises"
            right={
              <Select
                data-testid="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-36"
              >
                <option value="">all</option>
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            }
          >
            {loading && <p className="text-gray-500 text-sm">Loading…</p>}
            {!loading && exercises.length === 0 && (
              <p className="text-gray-500 text-sm">No exercises in this filter.</p>
            )}
            <div className="divide-y divide-gray-100">
              {exercises.map((ex) => (
                <ExerciseRow key={ex.id} ex={ex} onChange={changeStatus} />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-gray-900">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <span className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">{children}</span>;
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${props.className || ''}`}
    />
  );
}

function Select({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${className}`}
    >
      {children}
    </select>
  );
}

const STATUS_PILL = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-200 text-gray-700',
};

function ExerciseRow({ ex, onChange }) {
  return (
    <div data-testid="exercise-row" className="py-3 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_PILL[ex.status] || ''}`}>
            {ex.status}
          </span>
          <span>{ex.type}</span>
          <span>·</span>
          <span>{ex.difficulty}</span>
          <span>·</span>
          <span>{ex.source}</span>
        </div>
        <div className="text-gray-900 truncate">{ex.prompt}</div>
        <div className="text-sm text-gray-500 mt-0.5 truncate">
          → {ex.correct_answer || (ex.accepted_answers || [])[0]}
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {(ex.skill_tags || []).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {ex.status !== 'published' && (
          <button
            onClick={() => onChange(ex.id, 'published')}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-3 rounded transition"
          >
            Publish
          </button>
        )}
        {ex.status !== 'archived' && (
          <button
            onClick={() => onChange(ex.id, 'archived')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium py-1.5 px-3 rounded transition"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}

function CalibrationPanel({ attempts, loading, onRefresh }) {
  const drifted = attempts.filter((a) => a.drifted_tags).length;
  return (
    <>
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-gray-900">Recent wrong attempts</h3>
          <p className="text-sm text-gray-500">
            {attempts.length} shown · {drifted} with classifier drift
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
        >
          Refresh
        </button>
      </div>
      {loading && <p className="text-gray-500 text-sm py-4 text-center">Loading…</p>}
      {!loading && attempts.length === 0 && (
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No wrong attempts logged yet.</p>
        </div>
      )}
      <div className="space-y-3">
        {attempts.map((a) => <AttemptRow key={a.id} attempt={a} />)}
      </div>
    </>
  );
}

function AttemptRow({ attempt: a }) {
  const ex = a.exercise;
  return (
    <div className={`bg-white rounded-xl shadow-card border p-4 ${a.drifted_tags ? 'border-yellow-300' : 'border-gray-100'}`}>
      <div className="text-xs text-gray-500 mb-2">
        {new Date(a.created_at).toLocaleString()} · user {String(a.user_id).slice(0, 8)}
        {a.drifted_tags && <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">drift</span>}
      </div>
      <div className="text-sm">
        <div><span className="text-gray-500">Q:</span> {ex?.prompt || '(removed)'}</div>
        <div className="mt-1"><span className="text-gray-500">Expected:</span> <span className="font-medium">{ex?.correct_answer || (ex?.accepted_answers || [])[0]}</span></div>
        <div className="mt-1"><span className="text-gray-500">Answer:</span> <code className="px-1.5 py-0.5 bg-gray-100 rounded">{a.answer || '∅'}</code></div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="text-xs text-gray-500 mr-1">logged:</span>
        {(a.error_tags || []).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">{t}</span>
        ))}
      </div>
      {a.reclassified && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-500 mr-1">now:</span>
          {a.reclassified.errorTags.map((t) => (
            <span
              key={t}
              className={`px-2 py-0.5 rounded-full text-xs ${
                a.drifted_tags ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
