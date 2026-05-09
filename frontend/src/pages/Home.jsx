import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Home() {
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    api.modulesList()
      .then((r) => {
        if (cancelled) return;
        setModules(r.modules || []);
        setTotal(r.total_published || 0);
      })
      .catch((e) => !cancelled && toast.push(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
              Endless practice
            </h2>
            <p className="text-gray-600 text-sm max-w-lg">
              Mixed questions from every module you've touched. The selector
              prioritizes weak skills and items due for review.
            </p>
          </div>
          <a
            href="#/practice"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-card hover:shadow-card-hover whitespace-nowrap"
          >
            Start practice
            <span aria-hidden>→</span>
          </a>
        </div>
        {total > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            {total} questions published across {modules.length} modules.
          </p>
        )}
      </section>

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
