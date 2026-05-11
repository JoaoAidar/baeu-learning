import { getStore } from '../config/db.js';
import { generateExercises } from './LLMGenerator.js';

const VALID_TYPES = ['multiple_choice', 'translation', 'fill_blank'];
const VALID_STATUS = ['draft', 'published', 'archived'];
const VALID_DIFFICULTY = ['easy', 'medium', 'hard'];
const VALID_LOCALES = ['en', 'pt', 'ko'];

export function validateExercise(raw, idx) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { errors: [`item[${idx}]: not an object`], value: null };
  }
  const v = {};

  if (!raw.prompt || typeof raw.prompt !== 'string') errors.push(`item[${idx}].prompt is required`);
  else v.prompt = raw.prompt.trim();

  if (!VALID_TYPES.includes(raw.type)) errors.push(`item[${idx}].type must be one of ${VALID_TYPES.join(',')}`);
  else v.type = raw.type;

  v.difficulty = VALID_DIFFICULTY.includes(raw.difficulty) ? raw.difficulty : 'easy';
  v.status = VALID_STATUS.includes(raw.status) ? raw.status : 'draft';
  v.prompt_locale = VALID_LOCALES.includes(raw.prompt_locale) ? raw.prompt_locale : 'en';
  v.lesson_id = raw.lesson_id || null;
  v.options = Array.isArray(raw.options) ? raw.options : [];
  v.correct_answer = raw.correct_answer ?? null;
  v.accepted_answers = Array.isArray(raw.accepted_answers) ? raw.accepted_answers : [];
  v.explanation = raw.explanation || '';
  v.skill_tags = Array.isArray(raw.skill_tags) ? raw.skill_tags : [];
  v.metadata = raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {};
  v.source = raw.source && ['manual', 'import', 'generated'].includes(raw.source) ? raw.source : 'import';

  if (v.type === 'multiple_choice') {
    if (!v.options.length) errors.push(`item[${idx}].options required for multiple_choice`);
    if (!v.correct_answer) errors.push(`item[${idx}].correct_answer required for multiple_choice`);
  } else {
    if (!v.correct_answer && !v.accepted_answers.length) {
      errors.push(`item[${idx}].correct_answer or accepted_answers required`);
    }
  }
  return { errors, value: errors.length ? null : v };
}

export async function importExercises(items, { createdBy, source } = {}) {
  if (!Array.isArray(items)) {
    return { created: 0, failed: [{ index: -1, errors: ['payload must be an array'] }] };
  }
  const valid = [];
  const failed = [];
  items.forEach((raw, idx) => {
    const { errors, value } = validateExercise(raw, idx);
    if (errors.length) failed.push({ index: idx, errors });
    else valid.push({ ...value, source: source || value.source, created_by: createdBy || null });
  });

  let created = [];
  if (valid.length) {
    const store = getStore();
    created = await store.insertExercises(valid);
  }
  return { created: created.length, failed, ids: created.map((e) => e.id) };
}

export async function generateAndImport({ createdBy, autoPublish = false, ...opts }) {
  const generated = await generateExercises(opts);
  const stamped = generated.map((e) => ({
    ...e,
    status: autoPublish ? 'published' : 'draft',
    source: 'generated',
  }));
  const result = await importExercises(stamped, { createdBy, source: 'generated' });
  return { ...result, generated: generated.length };
}

export async function setExerciseStatus({ id, status }) {
  if (!VALID_STATUS.includes(status)) {
    const e = new Error('invalid_status'); e.status = 400; throw e;
  }
  const store = getStore();
  // memoryStore: direct mutation; pgStore: use updateExerciseStatus if exposed; fall back to update via raw
  const ex = await store.getExercise(id);
  if (!ex) { const e = new Error('not_found'); e.status = 404; throw e; }
  if (typeof store.updateExerciseStatus === 'function') {
    return store.updateExerciseStatus(id, status);
  }
  ex.status = status;
  return ex;
}

export async function listExercisesByStatus(status) {
  const store = getStore();
  if (typeof store.listExercisesByStatus === 'function') {
    return store.listExercisesByStatus(status);
  }
  // memory fallback: scan
  const all = await store.listAllExercises?.();
  if (all) return all.filter((e) => !status || e.status === status);
  // last resort: only published is supported
  return store.listPublishedExercises();
}
