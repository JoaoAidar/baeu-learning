import React, { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import { speak, hasHangul, speechSupported } from '../utils/speech.js';

// SNS-style conversation simulator. Pick a persona → chat in Korean (IME) →
// end the chat for structured semantic + syntactic feedback. LLM-backed on the
// backend; this page only orchestrates turns.

const ACCENTS = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
};

export default function Chat() {
  const [view, setView] = useState('pick'); // 'pick' | 'chat' | 'feedback'
  const [personas, setPersonas] = useState(null);
  const [loadErr, setLoadErr] = useState(null);

  const [persona, setPersona] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [starting, setStarting] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let off = false;
    api.chat
      .personas()
      .then((r) => { if (!off) setPersonas(r.personas || []); })
      .catch((e) => { if (!off) setLoadErr(e.message || 'Could not load personas.'); });
    return () => { off = true; };
  }, []);

  async function pick(p) {
    setStarting(true);
    try {
      const res = await api.chat.start(p.slug);
      setPersona(res.persona);
      setConversationId(res.conversationId);
      setMessages(res.messages || []);
      setFeedback(null);
      setView('chat');
    } catch (e) {
      toast.push(friendly(e), 'error');
    } finally {
      setStarting(false);
    }
  }

  function reset() {
    setView('pick');
    setPersona(null);
    setConversationId(null);
    setMessages([]);
    setFeedback(null);
  }

  if (view === 'feedback' && feedback) {
    return <Feedback persona={persona} feedback={feedback} onRestart={reset} />;
  }

  if (view === 'chat' && persona) {
    return (
      <ChatRoom
        persona={persona}
        conversationId={conversationId}
        messages={messages}
        setMessages={setMessages}
        onEnded={(fb) => { setFeedback(fb); setView('feedback'); }}
        onBack={reset}
      />
    );
  }

  return (
    <Picker personas={personas} loadErr={loadErr} starting={starting} onPick={pick} />
  );
}

function Picker({ personas, loadErr, starting, onPick }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Conversation practice</h1>
        <p className="text-gray-600 mt-1">
          Chat in Korean (Hangul) with a partner. When you're done, get feedback on what you
          wrote — meaning, grammar, particles and naturalness.
        </p>
      </div>

      {loadErr && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">
          {loadErr}
        </div>
      )}

      {!personas && !loadErr && (
        <div className="text-gray-500 text-sm">Loading scenarios…</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {(personas || []).map((p) => (
          <button
            key={p.slug}
            type="button"
            disabled={starting}
            onClick={() => onPick(p)}
            data-testid={`persona-${p.slug}`}
            className="text-left bg-white rounded-xl shadow-card border border-gray-100 p-5 hover:border-primary-300 hover:shadow-md transition disabled:opacity-60"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl" aria-hidden>{p.emoji}</span>
              <div>
                <div className="font-heading font-bold text-gray-900 leading-tight">
                  <span lang="ko">{p.name}</span>
                </div>
                <div className="text-xs text-gray-500">{p.scenario}</div>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${ACCENTS[p.accent] || ACCENTS.blue}`}>
                <span lang="ko">{p.register}</span>
              </span>
            </div>
            <p className="text-sm text-gray-600">{p.blurb}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatRoom({ persona, conversationId, messages, setMessages, onEnded, onBack }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [full, setFull] = useState(false);
  const composing = useRef(false);
  const endRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    // Optimistic learner bubble.
    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: 'learner', content: text }]);
    setSending(true);
    try {
      const res = await api.chat.reply(conversationId, text);
      setMessages((m) => [
        ...m.filter((x) => x.id !== tempId),
        res.learner,
        res.message,
      ]);
      if (res.full) setFull(true);
    } catch (e) {
      // Roll back the optimistic bubble and restore the text so nothing is lost.
      setMessages((m) => m.filter((x) => x.id !== tempId));
      setInput(text);
      if (e instanceof ApiError && e.code === 'conversation_full') {
        setFull(true);
        toast.push('This chat is full — end it to get your feedback.', 'info');
      } else {
        toast.push(friendly(e), 'error');
      }
    } finally {
      setSending(false);
    }
  }

  async function finish() {
    if (ending) return;
    const learnerTurns = messages.filter((m) => m.role === 'learner').length;
    if (learnerTurns === 0) {
      toast.push('Say something first, then end the chat for feedback.', 'info');
      return;
    }
    setEnding(true);
    try {
      const res = await api.chat.end(conversationId);
      onEnded(res.feedback);
    } catch (e) {
      toast.push(friendly(e), 'error');
    } finally {
      setEnding(false);
    }
  }

  function onKeyDown(e) {
    // Enter sends — but never while an IME candidate is composing (essential for
    // Hangul input), and Shift+Enter inserts a newline.
    if (e.key === 'Enter' && !e.shiftKey && !composing.current) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ minHeight: '70vh' }}>
      {/* Persona header */}
      <div className="flex items-center gap-3 bg-white rounded-t-xl border border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to scenarios"
          className="text-gray-400 hover:text-gray-700 text-lg leading-none bg-transparent"
        >
          ←
        </button>
        <span className="text-2xl" aria-hidden>{persona.emoji}</span>
        <div className="leading-tight">
          <div className="font-heading font-bold text-gray-900"><span lang="ko">{persona.name}</span></div>
          <div className="text-xs text-gray-500">{persona.scenario} · <span lang="ko">{persona.register}</span></div>
        </div>
        <button
          type="button"
          onClick={finish}
          disabled={ending}
          data-testid="end-chat-btn"
          className="ml-auto text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 disabled:opacity-60 px-3 py-2 rounded-lg transition"
        >
          {ending ? 'Reviewing…' : 'End & get feedback'}
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto bg-[#b2c7d9] border-x border-gray-200 px-3 py-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} persona={persona} />
        ))}
        {sending && <TypingBubble persona={persona} />}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="bg-white rounded-b-xl border border-gray-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={() => { composing.current = false; }}
            rows={1}
            lang="ko"
            disabled={full}
            data-testid="chat-input"
            placeholder={full ? 'Chat full — end it for feedback' : '한국어로 답하세요…'}
            className="flex-1 resize-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || full || !input.trim()}
            data-testid="chat-send"
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg transition"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Type in Hangul. Enter sends · Shift+Enter for a new line. Mistakes are fine — you'll see
          corrections at the end.
        </p>
      </div>
    </div>
  );
}

function Bubble({ message, persona }) {
  const isLearner = message.role === 'learner';
  if (isLearner) {
    return (
      <div className="flex justify-end">
        <div lang="ko" className="max-w-[80%] bg-primary-500 text-white rounded-2xl rounded-br-sm px-3.5 py-2 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start items-end gap-2">
      <span className="text-xl mb-1 flex-shrink-0" aria-hidden>{persona.emoji}</span>
      <div className="max-w-[80%]">
        <div className="flex items-end gap-1">
          <div lang="ko" className="bg-white text-gray-900 rounded-2xl rounded-bl-sm px-3.5 py-2 shadow-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <SpeakButton text={message.content} />
        </div>
      </div>
    </div>
  );
}

function TypingBubble({ persona }) {
  return (
    <div className="flex justify-start items-end gap-2" aria-hidden>
      <span className="text-xl mb-1" >{persona.emoji}</span>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <span className="inline-flex gap-1">
          <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
        </span>
      </div>
    </div>
  );
}

function Dot({ delay = '0ms' }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}

function Feedback({ persona, feedback, onRestart }) {
  const { overall, messages, semantic, vocab, phrases } = feedback;
  const corrected = (messages || []).filter((m) => m.hasIssues);
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Chat feedback</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          With <span lang="ko">{persona?.name}</span> · {persona?.scenario}
        </p>
      </div>

      {/* Overall */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg" aria-hidden>📝</span>
          <h2 className="font-heading font-bold text-gray-900">Overall</h2>
          {overall?.level && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              {overall.level}
            </span>
          )}
        </div>
        {overall?.summary && <p className="text-gray-700">{overall.summary}</p>}
        {overall?.encouragement && (
          <p className="text-primary-700 font-medium mt-2">{overall.encouragement}</p>
        )}
      </div>

      {/* Semantic */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg" aria-hidden>{semantic?.communicated ? '✅' : '⚠️'}</span>
          <h2 className="font-heading font-bold text-gray-900">Did your meaning come across?</h2>
        </div>
        <p className="text-gray-700">
          {semantic?.communicated
            ? 'Yes — your message was understandable.'
            : 'Partly — some of your meaning was unclear.'}
        </p>
        {semantic?.notes && <p className="text-gray-600 text-sm mt-1.5">{semantic.notes}</p>}
      </div>

      {/* Per-message corrections */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg" aria-hidden>🔧</span>
          <h2 className="font-heading font-bold text-gray-900">Corrections</h2>
        </div>
        {corrected.length === 0 ? (
          <p className="text-gray-600 text-sm">No corrections — your Korean was clean this round. 잘했어요!</p>
        ) : (
          <ul className="space-y-4">
            {corrected.map((m, i) => (
              <li key={i} className="border-l-2 border-primary-200 pl-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span lang="ko" className="text-gray-400 line-through">{m.original}</span>
                  <span className="text-gray-400">→</span>
                  <span lang="ko" className="text-gray-900 font-semibold">{m.corrected}</span>
                  <SpeakButton text={m.corrected} />
                </div>
                {Array.isArray(m.issues) && m.issues.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {m.issues.map((iss, j) => (
                      <li key={j} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 flex-shrink-0 h-fit">
                          {iss.type}
                        </span>
                        <span>{iss.explanation}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {m.naturalness && <p className="text-xs text-gray-500 mt-1 italic">{m.naturalness}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vocab + phrases */}
      {(vocab?.length > 0 || phrases?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {vocab?.length > 0 && (
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
              <h2 className="font-heading font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide text-gray-500">Words to review</h2>
              <ul className="space-y-1.5">
                {vocab.map((v, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span lang="ko" className="font-semibold text-gray-900">{v.ko}</span>
                    <SpeakButton text={v.ko} />
                    <span className="text-gray-500">— {v.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {phrases?.length > 0 && (
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
              <h2 className="font-heading font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide text-gray-500">Phrases you could use</h2>
              <ul className="space-y-1.5">
                {phrases.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span lang="ko" className="font-semibold text-gray-900">{p.ko}</span>
                    <SpeakButton text={p.ko} />
                    <span className="text-gray-500">— {p.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          New conversation
        </button>
        <a
          href="#/progress"
          className="inline-flex items-center justify-center text-gray-600 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg no-underline"
        >
          See progress
        </a>
      </div>
    </div>
  );
}

function SpeakButton({ text, className = '' }) {
  if (!hasHangul(text) || !speechSupported()) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label="Play Korean pronunciation"
      title="Play pronunciation"
      className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors flex-shrink-0 ${className}`}
    >
      <span aria-hidden>🔊</span>
    </button>
  );
}

function friendly(e) {
  if (e instanceof ApiError) {
    if (e.code === 'llm_not_configured') return 'Conversation practice needs the AI to be configured on the server.';
    if (e.code === 'chat_daily_cap_reached') return "You've reached today's conversation limit. Try again tomorrow.";
    if (e.kind === 'network') return e.message;
    return e.message;
  }
  return e?.message || 'Something went wrong.';
}
