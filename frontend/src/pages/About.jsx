import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function About() {
  const [moduleCount, setModuleCount] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.modulesList()
      .then((r) => {
        if (cancelled) return;
        setModuleCount((r.modules || []).length);
        setQuestionCount(r.total_published || null);
      })
      .catch(() => { /* silent — public page */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div data-testid="about-page" className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8 animate-fade-in">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">About Baeu</h1>
        <p className="text-gray-600">
          Baeu is a Korean practice app that turns short, mixed exercises into
          steady mastery through spaced review.
        </p>
      </div>

      <Section title="Who it's for">
        <p className="text-gray-700">
          Self-directed learners working toward TOPIK 1 who want frequent,
          low-friction practice with honest progress signals — not a course.
        </p>
      </Section>

      <Section title="What's there today">
        <p className="text-gray-700">
          {moduleCount !== null ? `${moduleCount} module${moduleCount === 1 ? '' : 's'}` : 'A handful of modules'}{' '}
          and {questionCount !== null ? `${questionCount} published questions` : 'published questions'} across
          translation, multiple choice, and fill-in-the-blank. The adaptive
          review queue resurfaces what you keep getting wrong, and the Progress
          page shows accuracy, skill mastery, weak tags, and recent activity.
        </p>
      </Section>

      <Section title="For cohorts and sponsors">
        <p className="text-gray-700">
          Baeu is currently best suited for a small, supervised learner cohort:
          a teacher, parent, or sponsor can ask learners to practice daily and
          review their Progress screen as a lightweight report. It is not yet a
          school LMS, placement test, certificate, or payment product.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <ProofItem label="Latest learner smoke" value="Passed 2026-06-29" />
          <ProofItem label="Account safety smoke" value="Passed IDOR check" />
          <ProofItem label="Native review" value="Draft grammar still flagged" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-5">
          <a
            href="#/"
            className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-5 rounded-lg transition-all no-underline"
          >
            Try learner flow →
          </a>
          <a
            href="#/progress"
            className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-5 rounded-lg transition-all no-underline"
          >
            View progress report
          </a>
        </div>
      </Section>

      <Section title="Pedagogy scope">
        <p className="text-gray-700">
          The curriculum is TOPIK 1-oriented and intentionally narrow: Hangul,
          beginner grammar, common vocabulary, particles, sentence patterns, and
          reading drills. New grammar lessons are marked as draft material until
          a native Korean reviewer signs off.
        </p>
      </Section>

      <Section title="Privacy and support">
        <p className="text-gray-700">
          Accounts store email, practice attempts, skill mastery, and session
          progress so review can persist across logins. Early users should treat
          the product as a learning beta and contact Joao directly for support,
          account deletion, or cohort setup.
        </p>
      </Section>

      <Section title="Pricing">
        <p className="text-gray-700">
          Free during early access. No payment integration yet — we want to earn
          the right to charge before we ask.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
      <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function ProofItem({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
