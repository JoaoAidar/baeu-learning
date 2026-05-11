import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function About() {
  const [moduleCount, setModuleCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.modulesList()
      .then((r) => { if (!cancelled) setModuleCount((r.modules || []).length); })
      .catch(() => { /* silent — public page */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div data-testid="about-page" className="max-w-2xl mx-auto space-y-6">
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
          of curated exercises (translation, multiple choice, fill-in-the-blank)
          plus an adaptive review queue that resurfaces what you keep getting
          wrong. Your skill levels and accuracy are visible on the Progress page.
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
