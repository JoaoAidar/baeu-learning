import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const TAG_LABELS = {
  vocabulary: 'vocabulary',
  particle: 'particles',
  word_order: 'word order',
  verb_conjugation: 'verb conjugation',
  honorific_formality: 'formality',
  hangul_reading: 'hangul reading',
  spacing: 'spacing',
  romanization_dependency: 'avoid romanization',
  unknown: 'unclassified',
};

export default function EndlessPractice() {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [checkpoint, setCheckpoint] = useState(null);
  const [score, setScore] = useState({ total: 0, correct: 0, accuracy: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionStart, setQuestionStart] = useState(0);

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const s = await api.startSession();
      setSession(s);
      setScore({ total: 0, correct: 0, accuracy: 0 });
      setCheckpoint(null);
      setFeedback(null);
      await loadNext(s.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadNext(sessionId, focus = null) {
    setFeedback(null);
    setAnswer('');
    setCheckpoint(null);
    setLoading(true);
    try {
      const q = await api.next(sessionId, focus);
      setQuestion(q);
      setQuestionStart(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!question || !answer.trim()) return;
    setLoading(true);
    try {
      const r = await api.answer({
        sessionId: session.id,
        exerciseId: question.id,
        answer,
        responseMs: Date.now() - questionStart,
      });
      setFeedback(r);
      setScore(r.sessionScore);
      if (r.checkpoint) setCheckpoint(r.checkpoint);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function pickOption(id) {
    setAnswer(id);
  }

  if (!session) {
    return (
      <div className="card">
        <p>Press <strong>Start</strong> to begin an endless practice session.</p>
        {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
        <button className="btn" onClick={start} disabled={loading}>
          {loading ? '...' : 'Start'}
        </button>
      </div>
    );
  }

  return (
    <>
      <ScoreBar score={score} />
      {checkpoint ? (
        <Checkpoint
          checkpoint={checkpoint}
          onContinue={(focus) => loadNext(session.id, focus)}
        />
      ) : feedback ? (
        <Feedback
          feedback={feedback}
          onNext={() => loadNext(session.id)}
        />
      ) : question ? (
        <QuestionCard
          question={question}
          answer={answer}
          setAnswer={setAnswer}
          pickOption={pickOption}
          submit={submit}
          loading={loading}
        />
      ) : null}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
    </>
  );
}

function ScoreBar({ score }) {
  const pct = score.total ? Math.round(score.accuracy * 100) : 0;
  return (
    <div className="card">
      <div className="score">
        <div className="big">{score.correct}/{score.total}</div>
        <div className="muted">{pct}% accuracy this session</div>
      </div>
      <div className="bar"><div style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function QuestionCard({ question, answer, setAnswer, pickOption, submit, loading }) {
  const isMC = question.type === 'multiple_choice';
  return (
    <div className="card">
      <div className="muted" style={{ marginBottom: 6 }}>
        {question.type} · {question.difficulty}
      </div>
      <div className="prompt">{question.prompt}</div>
      {isMC ? (
        <div className="options">
          {(question.options || []).map((o) => (
            <button
              key={o.id}
              className={`option ${answer === o.id ? 'selected' : ''}`}
              onClick={() => pickOption(o.id)}
            >
              {o.text}
            </button>
          ))}
        </div>
      ) : (
        <input
          className="input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
      )}
      <div className="divider" />
      <button className="btn" disabled={!answer || loading} onClick={submit}>
        {loading ? '...' : 'Submit'}
      </button>
      {(question.skill_tags || []).length > 0 && (
        <div style={{ marginTop: 12 }}>
          {question.skill_tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  );
}

function Feedback({ feedback, onNext }) {
  const cls = feedback.correct ? 'correct' : 'wrong';
  return (
    <div className={`card feedback ${cls}`}>
      <h3 style={{ marginTop: 0 }}>
        {feedback.correct ? '✓ Correct' : '✗ Not quite'}
      </h3>
      {!feedback.correct && (
        <p>
          <strong>Expected:</strong> {feedback.expectedAnswer}
        </p>
      )}
      {feedback.explanation && <p className="muted">{feedback.explanation}</p>}
      {!feedback.correct && feedback.errorTags?.length > 0 && (
        <div>
          {feedback.errorTags.map((t) => (
            <span key={t} className="tag error">{TAG_LABELS[t] || t}</span>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

function Checkpoint({ checkpoint, onContinue }) {
  const pct = Math.round(checkpoint.accuracy * 100);
  const tags = Object.entries(checkpoint.errorTagCounts || {})
    .sort((a, b) => b[1] - a[1]);
  return (
    <div className="card checkpoint">
      <h2>Checkpoint — last 10</h2>
      <div className="score">
        <div className="big">{checkpoint.correct}/{checkpoint.windowSize}</div>
        <div className="muted">{pct}% on this round</div>
      </div>
      {tags.length > 0 ? (
        <>
          <p className="muted">Areas to review:</p>
          <div>
            {tags.map(([t, n]) => (
              <span key={t} className="tag error">
                {TAG_LABELS[t] || t} · {n}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">No errors. Keep going.</p>
      )}
      <div className="divider" />
      <div className="row">
        <button className="btn" onClick={() => onContinue(null)}>Continue</button>
        <button
          className="btn secondary"
          onClick={() => onContinue('weak')}
          disabled={tags.length === 0}
        >
          Review weak areas
        </button>
      </div>
    </div>
  );
}
