import React, { useEffect, useState } from 'react';
import { adminApi, adminAuth } from '../api.js';

const STATUS_ORDER = ['draft', 'published', 'archived'];

export default function Admin() {
  const [token, setToken] = useState(adminAuth.getToken() || '');
  const [authed, setAuthed] = useState(!!adminAuth.getToken());
  const [tab, setTab] = useState('content');
  const [statusFilter, setStatusFilter] = useState('draft');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);

  // Generate form
  const [topic, setTopic] = useState('greetings');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('easy');
  const [autoPublish, setAutoPublish] = useState(false);
  const [genResult, setGenResult] = useState(null);

  // Import form
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'content') loadList();
    if (tab === 'calibration') loadAttempts();
  }, [authed, statusFilter, tab]);

  async function loadAttempts() {
    setError(null);
    setLoading(true);
    try {
      const r = await adminApi.recentAttempts({ wrongOnly: true, limit: 50 });
      setRecentAttempts(r.attempts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function saveToken() {
    if (!token.trim()) return;
    adminAuth.set(token.trim());
    setAuthed(true);
  }

  function logout() {
    adminAuth.clear();
    setAuthed(false);
    setExercises([]);
  }

  async function loadList() {
    setError(null);
    setLoading(true);
    try {
      const r = await adminApi.list(statusFilter);
      setExercises(r.exercises || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function runGenerate(e) {
    e.preventDefault();
    setGenResult(null);
    setLoading(true);
    try {
      const r = await adminApi.generate({
        topic,
        count: Number(count),
        difficulty,
        autoPublish,
        types: ['multiple_choice', 'translation', 'fill_blank'],
      });
      setGenResult(r);
      await loadList();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function runImport(e) {
    e.preventDefault();
    setImportResult(null);
    setError(null);
    let parsed;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setError('Invalid JSON');
      return;
    }
    setLoading(true);
    try {
      const r = await adminApi.importJson(parsed);
      setImportResult(r);
      await loadList();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      await adminApi.setStatus(id, status);
      await loadList();
    } catch (e) {
      setError(e.message);
    }
  }

  if (!authed) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Admin</h2>
        <p className="muted">Enter the admin token to manage exercises.</p>
        <input
          className="input"
          style={{ marginBottom: 12 }}
          type="password"
          placeholder="x-admin-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="btn" onClick={saveToken}>Unlock</button>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Admin</h2>
          <div className="row">
            <button
              className={tab === 'content' ? 'btn' : 'btn secondary'}
              onClick={() => setTab('content')}
            >
              Content
            </button>
            <button
              className={tab === 'calibration' ? 'btn' : 'btn secondary'}
              onClick={() => setTab('calibration')}
            >
              Calibration
            </button>
            <button className="btn secondary" onClick={logout}>Lock</button>
          </div>
        </div>
      </div>

      {tab === 'calibration' && (
        <CalibrationPanel
          attempts={recentAttempts}
          loading={loading}
          error={error}
          onRefresh={loadAttempts}
        />
      )}

      {tab === 'content' && <>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Generate via LLM</h3>
        <form onSubmit={runGenerate}>
          <div className="row" style={{ marginBottom: 8, gap: 8 }}>
            <input
              className="input"
              style={{ flex: 2 }}
              placeholder="Topic (e.g. greetings, food, particles)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <input
              className="input"
              style={{ width: 90 }}
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <select
              className="input"
              style={{ width: 130 }}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
            />{' '}
            Auto-publish (skip draft review)
          </label>
          <button className="btn" disabled={loading}>
            {loading ? '...' : 'Generate'}
          </button>
        </form>
        {genResult && (
          <p className="muted" style={{ marginTop: 12 }}>
            Generated {genResult.generated}, created {genResult.created}, failed {genResult.failed?.length || 0}.
          </p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Import JSON</h3>
        <form onSubmit={runImport}>
          <textarea
            className="input"
            style={{ minHeight: 140, fontFamily: 'monospace', marginBottom: 12 }}
            placeholder='[{"type":"translation","prompt":"...","correct_answer":"...","accepted_answers":["..."],"skill_tags":["..."],"status":"published"}]'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <button className="btn" disabled={loading}>Import</button>
        </form>
        {importResult && (
          <p className="muted" style={{ marginTop: 12 }}>
            Created {importResult.created}, failed {importResult.failed?.length || 0}.
          </p>
        )}
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Exercises</h3>
          <select
            className="input"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">all</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
        {loading && <p className="muted">Loading…</p>}
        {!loading && exercises.length === 0 && <p className="muted">No exercises.</p>}
        {exercises.map((ex) => (
          <ExerciseRow key={ex.id} ex={ex} onChange={changeStatus} />
        ))}
      </div>
      </>}
    </>
  );
}

function CalibrationPanel({ attempts, loading, error, onRefresh }) {
  const drifted = attempts.filter((a) => a.drifted_tags).length;
  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0 }}>Recent wrong attempts</h3>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              {attempts.length} shown · {drifted} with classifier drift since the attempt was logged
            </p>
          </div>
          <button className="btn secondary" onClick={onRefresh}>Refresh</button>
        </div>
      </div>
      {error && <div className="card"><p style={{ color: 'var(--error)' }}>{error}</p></div>}
      {loading && <div className="card"><p className="muted">Loading…</p></div>}
      {!loading && attempts.length === 0 && (
        <div className="card"><p className="muted">No wrong attempts yet.</p></div>
      )}
      {attempts.map((a) => <AttemptRow key={a.id} attempt={a} />)}
    </>
  );
}

function AttemptRow({ attempt: a }) {
  const ex = a.exercise;
  return (
    <div className="card">
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
        {new Date(a.created_at).toLocaleString()} · user {String(a.user_id).slice(0, 8)}
      </div>
      <div style={{ marginBottom: 6 }}>
        <strong>Q:</strong> {ex?.prompt || '(exercise removed)'}
      </div>
      <div style={{ marginBottom: 6 }}>
        <strong>Expected:</strong> {ex?.correct_answer || (ex?.accepted_answers || [])[0]}
      </div>
      <div style={{ marginBottom: 6 }}>
        <strong>Answer:</strong> <code>{a.answer || '(empty)'}</code>
      </div>
      <div style={{ marginBottom: 4 }}>
        <span className="muted" style={{ fontSize: 13 }}>logged tags: </span>
        {(a.error_tags || []).map((t) => <span key={t} className="tag error">{t}</span>)}
      </div>
      {a.reclassified && (
        <div>
          <span className="muted" style={{ fontSize: 13 }}>reclassified now: </span>
          {a.reclassified.errorTags.map((t) => (
            <span key={t} className="tag" style={{ background: a.drifted_tags ? 'rgba(255,200,0,0.18)' : undefined }}>
              {t}
            </span>
          ))}
          {a.drifted_tags && <span className="tag error" style={{ marginLeft: 6 }}>drift</span>}
        </div>
      )}
    </div>
  );
}

function ExerciseRow({ ex, onChange }) {
  return (
    <div style={{ borderTop: '1px solid #262b34', padding: '12px 0' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div className="muted" style={{ fontSize: 12 }}>
            {ex.type} · {ex.difficulty} · {ex.status} · {ex.source}
          </div>
          <div>{ex.prompt}</div>
          <div className="muted" style={{ fontSize: 13 }}>
            → {ex.correct_answer || (ex.accepted_answers || [])[0]}
          </div>
          <div style={{ marginTop: 4 }}>
            {(ex.skill_tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <div className="row" style={{ flexShrink: 0 }}>
          {ex.status !== 'published' && (
            <button className="btn" onClick={() => onChange(ex.id, 'published')}>
              Publish
            </button>
          )}
          {ex.status !== 'archived' && (
            <button className="btn secondary" onClick={() => onChange(ex.id, 'archived')}>
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
