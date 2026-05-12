import React, { useRef, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

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

export default function EndlessPractice({ moduleSlug = null, moduleTitle = null }) {
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [checkpoint, setCheckpoint] = useState(null);
  const [score, setScore] = useState({ total: 0, correct: 0, accuracy: 0 });
  const [loading, setLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  // Synchronous lock for the submit handler. setLoading(true) only takes effect
  // after the next render, so a rapid double-tap can fire submit() twice before
  // the disabled state lands. The ref blocks the second call immediately.
  const submittingRef = useRef(false);
  const [questionStart, setQuestionStart] = useState(0);
  const toast = useToast();

  function isNoExercisesError(err) {
    const msg = (err && err.message) || '';
    return msg === 'no_exercises_in_module' || msg === 'no_published_exercises';
  }

  async function start() {
    setLoading(true);
    setEmptyState(false);
    try {
      const s = await api.startSession(moduleSlug);
      setSession(s);
      setScore({ total: 0, correct: 0, accuracy: 0 });
      setCheckpoint(null);
      setFeedback(null);
      await loadNext(s.id);
    } catch (e) {
      if (isNoExercisesError(e)) {
        setEmptyState(true);
      } else {
        toast.push(e.message, 'error');
      }
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
      if (isNoExercisesError(e)) {
        setEmptyState(true);
      } else {
        toast.push(e.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (submittingRef.current) return;
    if (!question || !answer.trim()) return;
    submittingRef.current = true;
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
      // The backend translates double-submit unique-violations to 409
      // `duplicate_submit`. That's a user-visible no-op — the first submit
      // already landed; suppress the scary toast.
      if (e.message !== 'duplicate_submit') {
        toast.push(e.message, 'error');
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  if (emptyState) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          data-testid="practice-empty-state"
          className="bg-white rounded-xl shadow-card border border-gray-100 p-10 text-center animate-fade-in"
        >
          <div className="text-5xl mb-3" aria-hidden>📭</div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">
            Nothing to practice yet
          </h1>
          <p className="text-gray-600 mb-6">
            {moduleSlug
              ? 'This module has no published exercises yet.'
              : 'No published exercises are available yet. Check back soon.'}
          </p>
          <a
            href="#/"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-card hover:shadow-card-hover no-underline"
          >
            ← Back to modules
          </a>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-10 text-center animate-fade-in">
          {moduleTitle && (
            <p className="text-sm text-secondary-700 font-semibold uppercase tracking-wide mb-2">
              {moduleTitle}
            </p>
          )}
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-3">
            {moduleSlug ? 'Module practice' : 'Endless practice'}
          </h1>
          <p className="text-gray-600 mb-6">
            {moduleSlug
              ? 'Endless drilling scoped to this module. Mastery and weak-area review still apply.'
              : 'Mixed questions from every module. The selector prioritizes weak skills and items due for review.'}
          </p>
          <button
            onClick={start}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-card hover:shadow-card-hover"
          >
            {loading ? 'Starting…' : 'Start'}
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ScoreBar score={score} />
      {checkpoint ? (
        <Checkpoint checkpoint={checkpoint} onContinue={(focus) => loadNext(session.id, focus)} />
      ) : feedback ? (
        <Feedback feedback={feedback} onNext={() => loadNext(session.id)} />
      ) : question ? (
        <QuestionCard
          key={question.id}
          question={question}
          answer={answer}
          setAnswer={setAnswer}
          submit={submit}
          loading={loading}
        />
      ) : null}
    </div>
  );
}

function ScoreBar({ score }) {
  const pct = score.total ? Math.round(score.accuracy * 100) : 0;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="font-heading text-2xl font-bold text-gray-900">
            {score.correct}<span className="text-gray-400 font-normal">/{score.total}</span>
          </div>
          <div className="text-xs text-gray-500">this session</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-bold text-primary-600">{pct}%</div>
          <div className="text-xs text-gray-500">accuracy</div>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestionCard({ question, answer, setAnswer, submit, loading }) {
  const isMC = question.type === 'multiple_choice';
  return (
    <div
      data-testid="question-card"
      data-question-id={question.id}
      className="bg-white rounded-xl shadow-card border border-gray-100 p-6 animate-fade-in"
    >
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 uppercase tracking-wide">
        <span className="px-2 py-0.5 bg-secondary-50 text-secondary-700 rounded font-semibold">
          {question.type.replace('_', ' ')}
        </span>
        <span>·</span>
        <span>{question.difficulty}</span>
      </div>
      <div className="text-xl font-medium text-gray-900 mb-5 leading-relaxed">
        {question.prompt}
      </div>

      {isMC ? (
        <div className="grid gap-2" data-testid="mc-options">
          {(question.options || []).map((o) => (
            <button
              key={o.id}
              data-testid="mc-option"
              disabled={loading}
              onClick={() => setAnswer(o.id)}
              className={`text-left px-4 py-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                answer === o.id
                  ? 'border-primary-500 bg-primary-50 text-primary-900'
                  : 'border-gray-200 bg-white hover:border-primary-300 text-gray-800'
              }`}
            >
              <span className="text-sm font-bold mr-2 text-gray-400">
                {o.id.toUpperCase()}.
              </span>
              <span className="text-base">{o.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder={
            question.type === 'translation'
              ? 'Type the meaning in English...'
              : 'Type your answer...'
          }
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      )}

      {(question.skill_tags || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {question.skill_tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      )}

      <button
        disabled={!answer || loading}
        onClick={submit}
        className="mt-5 w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
      >
        {loading ? 'Checking…' : 'Submit'}
      </button>
    </div>
  );
}

function Feedback({ feedback, onNext }) {
  const correct = feedback.correct;
  return (
    <div
      data-testid="feedback-card"
      className={`rounded-xl border-2 p-6 animate-fade-in ${
        correct ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300 animate-shake'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            correct ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {correct ? '✓' : '✗'}
        </div>
        <h3 className={`font-heading text-xl font-bold ${correct ? 'text-green-900' : 'text-red-900'}`}>
          {correct ? 'Correct!' : 'Not quite'}
        </h3>
      </div>
      {!correct && feedback.expectedAnswer && (
        <p className="text-gray-800 mb-2">
          <span className="text-gray-500 text-sm">Expected:</span>{' '}
          <span className="font-semibold">{feedback.expectedAnswer}</span>
        </p>
      )}
      {feedback.explanation && (
        <p className="text-gray-700 text-sm mb-3">{feedback.explanation}</p>
      )}
      {!correct && feedback.errorTags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {feedback.errorTags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"
            >
              {TAG_LABELS[t] || t}
            </span>
          ))}
        </div>
      )}

      {feedback.recommendedLesson && (
        <div className="mt-3 mb-1 p-3 rounded-lg bg-secondary-50 border border-secondary-200">
          <div className="text-xs text-secondary-700 font-semibold uppercase tracking-wide mb-1">
            Quick lesson available
          </div>
          <div className="text-gray-900 font-medium mb-1">
            {feedback.recommendedLesson.title}
          </div>
          {feedback.recommendedLesson.reason && (
            <div className="text-xs text-gray-600 mb-2">
              {feedback.recommendedLesson.reason}
            </div>
          )}
          <a
            href={`#/lesson/${feedback.recommendedLesson.slug}?from=${encodeURIComponent('#/practice')}`}
            className="inline-block text-sm text-secondary-700 hover:text-secondary-900 font-semibold no-underline"
          >
            Read the rule →
          </a>
        </div>
      )}

      <button
        onClick={onNext}
        className="mt-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
      >
        Continue →
      </button>
    </div>
  );
}

function Checkpoint({ checkpoint, onContinue }) {
  const pct = Math.round(checkpoint.accuracy * 100);
  const tags = Object.entries(checkpoint.errorTagCounts || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div data-testid="checkpoint-card" className="bg-white rounded-xl shadow-card border border-gray-100 p-8 text-center animate-fade-in">
      <div className="text-5xl mb-2">🎯</div>
      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
        Checkpoint
      </h2>
      <p className="text-gray-500 text-sm mb-5">last 10 questions</p>

      <div className="flex justify-center gap-8 mb-6">
        <div>
          <div className="font-heading text-3xl font-bold text-gray-900">
            {checkpoint.correct}/{checkpoint.windowSize}
          </div>
          <div className="text-xs text-gray-500">correct</div>
        </div>
        <div>
          <div className="font-heading text-3xl font-bold text-primary-600">{pct}%</div>
          <div className="text-xs text-gray-500">accuracy</div>
        </div>
      </div>

      {tags.length > 0 ? (
        <>
          <p className="text-sm text-gray-600 mb-2">Areas to review:</p>
          <div className="flex flex-wrap justify-center gap-1.5 mb-5">
            {tags.map(([t, n]) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                {TAG_LABELS[t] || t} · {n}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-green-700 text-sm mb-5 font-medium">Clean round! 잘했어요.</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={() => onContinue(null)}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
        >
          Continue
        </button>
        <button
          onClick={() => onContinue('weak')}
          disabled={tags.length === 0}
          className="bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
        >
          Review weak areas
        </button>
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      {children}
    </span>
  );
}
