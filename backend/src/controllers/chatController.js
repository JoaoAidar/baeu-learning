import * as Chat from '../services/ConversationService.js';

// Error propagation handled by global error handler in app.js.

export const listPersonas = async (_req, res, next) => {
  try {
    res.json({ personas: Chat.listPersonas() });
  } catch (err) {
    next(err);
  }
};

export const start = async (req, res, next) => {
  try {
    const personaSlug = req.body?.personaSlug || req.body?.persona || null;
    if (!personaSlug) {
      const e = new Error('missing_persona'); e.status = 400; throw e;
    }
    res.json(await Chat.start({ userId: req.userId, personaSlug }));
  } catch (err) {
    next(err);
  }
};

export const reply = async (req, res, next) => {
  try {
    const { text } = req.body || {};
    res.json(await Chat.reply({ userId: req.userId, conversationId: req.params.id, text }));
  } catch (err) {
    next(err);
  }
};

export const end = async (req, res, next) => {
  try {
    res.json(await Chat.end({ userId: req.userId, conversationId: req.params.id }));
  } catch (err) {
    next(err);
  }
};

export const get = async (req, res, next) => {
  try {
    res.json(await Chat.get({ userId: req.userId, conversationId: req.params.id }));
  } catch (err) {
    next(err);
  }
};
