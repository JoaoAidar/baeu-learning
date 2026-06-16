import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/repositories/memoryStore.js';
import { resetStoreForTests } from '../src/config/db.js';
import * as Chat from '../src/services/ConversationService.js';

// A fake OpenRouter fetch: persona replies in Korean; the evaluator returns a
// valid feedback JSON object. Switches on whether the request asks for json.
function fakeFetch(reply = '응 좋아!', feedback = null) {
  const fb = feedback || {
    overall: { summary: 'Good effort', level: 'TOPIK 1', encouragement: '화이팅!' },
    messages: [{ original: '안녕', hasIssues: false, corrected: '안녕', issues: [], naturalness: '' }],
    semantic: { communicated: true, notes: 'Meaning was clear.' },
    vocab: [{ ko: '안녕', en: 'hi' }],
    phrases: [{ ko: '잘 지냈어요?', en: 'How have you been?' }],
  };
  return async (_url, opts) => {
    const body = JSON.parse(opts.body);
    const wantsJson = body.response_format?.type === 'json_object';
    const content = wantsJson ? JSON.stringify(fb) : reply;
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content } }] }),
      text: async () => '',
    };
  };
}

function setup() {
  memoryStore.reset();
  resetStoreForTests(memoryStore);
  process.env.OPENROUTER_API_KEY = 'test-key';
}

test('listPersonas returns the curated set with no system prompt leaked', () => {
  setup();
  const personas = Chat.listPersonas();
  assert.equal(personas.length, 7);
  for (const p of personas) {
    assert.ok(p.slug && p.name && p.scenario);
    assert.equal(p.system, undefined); // never leak the prompt
  }
});

test('start creates a conversation seeded with the persona opening', async () => {
  setup();
  const res = await Chat.start({ userId: 'u1', personaSlug: 'minji-friend' });
  assert.ok(res.conversationId);
  assert.equal(res.persona.slug, 'minji-friend');
  assert.equal(res.messages.length, 1);
  assert.equal(res.messages[0].role, 'persona');
  assert.ok(res.messages[0].content.length > 0);
});

test('start rejects an unknown persona', async () => {
  setup();
  await assert.rejects(
    () => Chat.start({ userId: 'u1', personaSlug: 'nope' }),
    (e) => e.status === 404 && e.code === 'persona_not_found'
  );
});

test('reply appends learner + persona messages and calls the LLM', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'u1', personaSlug: 'minji-friend' });
  const res = await Chat.reply({
    userId: 'u1',
    conversationId,
    text: '안녕! 잘 지내?',
    fetchImpl: fakeFetch('응 잘 지내! 너는?'),
  });
  assert.equal(res.learner.role, 'learner');
  assert.equal(res.message.role, 'persona');
  assert.equal(res.message.content, '응 잘 지내! 너는?');
  assert.equal(res.messageCount, 3); // opening + learner + persona
});

test('reply rejects an empty message', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'u1', personaSlug: 'minji-friend' });
  await assert.rejects(
    () => Chat.reply({ userId: 'u1', conversationId, text: '   ', fetchImpl: fakeFetch() }),
    (e) => e.status === 400 && e.code === 'empty_message'
  );
});

test('IDOR: another user cannot reply to, end, or read a conversation', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'owner', personaSlug: 'minji-friend' });
  await Chat.reply({ userId: 'owner', conversationId, text: '안녕', fetchImpl: fakeFetch() });

  const forbidden = (p) => assert.rejects(p, (e) => e.status === 403 && e.code === 'conversation_forbidden');
  await forbidden(Chat.reply({ userId: 'attacker', conversationId, text: 'hi', fetchImpl: fakeFetch() }));
  await forbidden(Chat.end({ userId: 'attacker', conversationId, fetchImpl: fakeFetch() }));
  await forbidden(Chat.get({ userId: 'attacker', conversationId }));
});

test('end evaluates the transcript and is idempotent', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'u1', personaSlug: 'jihun-colleague' });
  await Chat.reply({ userId: 'u1', conversationId, text: '안녕하세요', fetchImpl: fakeFetch() });

  const first = await Chat.end({ userId: 'u1', conversationId, fetchImpl: fakeFetch() });
  assert.equal(first.alreadyEnded, false);
  assert.equal(first.feedback.semantic.communicated, true);
  assert.ok(Array.isArray(first.feedback.messages));

  // Re-ending returns stored feedback without another LLM call (fetch would throw).
  const again = await Chat.end({
    userId: 'u1',
    conversationId,
    fetchImpl: async () => { throw new Error('should not call LLM again'); },
  });
  assert.equal(again.alreadyEnded, true);
  assert.deepEqual(again.feedback.semantic, first.feedback.semantic);
});

test('end feeds conversation mistakes into diagnostics (attempts + mastery)', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'u1', personaSlug: 'jihun-colleague' });
  await Chat.reply({ userId: 'u1', conversationId, text: '나는 학생이다', fetchImpl: fakeFetch() });

  // Feedback with a register issue on one message → should record an attempt
  // tagged honorific_formality and lapse the 'formality' mastery skill.
  const feedback = {
    overall: { summary: 's', level: 'TOPIK 1', encouragement: 'e' },
    messages: [
      {
        original: '나는 학생이다',
        hasIssues: true,
        corrected: '저는 학생이에요',
        issues: [{ type: 'register', explanation: 'Use polite 존댓말.' }],
        naturalness: 'too blunt',
      },
    ],
    semantic: { communicated: true, notes: '' },
    vocab: [],
    phrases: [],
  };
  const res = await Chat.end({
    userId: 'u1',
    conversationId,
    fetchImpl: fakeFetch('네', feedback),
  });
  assert.equal(res.diagnostics.recorded, 1);
  assert.equal(res.diagnostics.withIssues, 1);

  const attempts = await memoryStore.listAttemptsForUser('u1');
  const convAttempt = attempts.find((a) => a.exercise_type === 'conversation');
  assert.ok(convAttempt, 'a conversation attempt was recorded');
  assert.equal(convAttempt.correct, false);
  assert.ok(convAttempt.error_tags.includes('honorific_formality'));

  const mastery = await memoryStore.getMastery('u1', 'formality');
  assert.ok(mastery, 'formality mastery row exists');
  assert.equal(mastery.total_attempts, 1);
  assert.equal(mastery.total_correct, 0);
});

test('end with no learner turns is rejected', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'u1', personaSlug: 'sua-newfriend' });
  await assert.rejects(
    () => Chat.end({ userId: 'u1', conversationId, fetchImpl: fakeFetch() }),
    (e) => e.status === 400 && e.code === 'nothing_to_evaluate'
  );
});

test('a conversation cannot be replied to after it ends', async () => {
  setup();
  const { conversationId } = await Chat.start({ userId: 'u1', personaSlug: 'minji-friend' });
  await Chat.reply({ userId: 'u1', conversationId, text: '안녕', fetchImpl: fakeFetch() });
  await Chat.end({ userId: 'u1', conversationId, fetchImpl: fakeFetch() });
  await assert.rejects(
    () => Chat.reply({ userId: 'u1', conversationId, text: '또?', fetchImpl: fakeFetch() }),
    (e) => e.status === 409 && e.code === 'conversation_ended'
  );
});
