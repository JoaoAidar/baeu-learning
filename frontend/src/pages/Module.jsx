import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Module({ slug }) {
  const [data, setData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.module(slug), api.lessonsList(slug)])
      .then(([d, ls]) => {
        if (cancelled) return;
        setData(d);
        setLessons(ls.lessons || []);
      })
      .catch((e) => !cancelled && toast.push(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <p className="text-gray-500 text-center py-12">Loading…</p>;
  if (!data) return null;

  const m = data.module;
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <a href="#/" className="text-sm text-gray-500 hover:text-primary-500 no-underline">
        ← all modules
      </a>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-secondary-50 text-secondary-700 font-heading font-bold text-2xl flex items-center justify-center flex-shrink-0">
            {m.icon || '·'}
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
              {m.title}
            </h2>
            <p className="text-gray-600">{m.description}</p>
            <p className="text-xs text-gray-400 mt-2">
              {m.exercise_count} published question{m.exercise_count === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <a
          href={`#/practice?module=${m.slug}`}
          className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all shadow-card hover:shadow-card-hover no-underline"
        >
          Practice this module →
        </a>
      </div>

      {lessons.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <h3 className="font-heading text-base font-bold text-gray-900 mb-3">
            Grammar lessons
          </h3>
          <div className="space-y-2">
            {lessons.map((l) => (
              <a
                key={l.slug}
                href={`#/lesson/${l.slug}?from=${encodeURIComponent(`#/module/${slug}`)}`}
                className="block px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition no-underline"
              >
                <div className="font-medium text-gray-900">{l.title}</div>
                {l.summary && <div className="text-sm text-gray-600 mt-0.5">{l.summary}</div>}
              </a>
            ))}
          </div>
        </div>
      )}

      {data.sample_skill_tags?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <h3 className="font-heading text-base font-bold text-gray-900 mb-3">
            What you'll see
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {data.sample_skill_tags.map(({ skill, count }) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
              >
                {skill} <span className="text-gray-400">· {count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
