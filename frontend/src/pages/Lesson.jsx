import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Lesson({ slug, returnTo = '#/' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.lesson(slug)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && toast.push(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="text-gray-500 text-center py-12">Loading…</p>;
  }
  if (!data?.lesson) return null;
  const l = data.lesson;

  return (
    <article className="max-w-2xl mx-auto">
      <a href={returnTo} className="text-sm text-gray-500 hover:text-primary-500 no-underline mb-4 inline-block">
        ← back
      </a>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-secondary-700 font-semibold mb-1">
          Grammar lesson
        </p>
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">{l.title}</h1>
        {l.summary && <p className="text-gray-600 text-lg">{l.summary}</p>}
        {l.related_error_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {l.related_error_tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8 prose-baeu">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {l.body_md}
        </ReactMarkdown>
      </div>

      <div className="mt-6 flex justify-between">
        <a href={returnTo} className="text-gray-500 hover:text-primary-500 no-underline">
          ← back
        </a>
        <a
          href="#/practice"
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all no-underline"
        >
          Practice now →
        </a>
      </div>
    </article>
  );
}
