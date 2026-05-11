import * as Auth from '../services/AuthService.js';

const wrap = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'internal_error' });
  }
};

export const signup = wrap((req) =>
  Auth.signup({
    email: req.body?.email,
    password: req.body?.password,
    displayName: req.body?.displayName,
  })
);

export const login = wrap((req) =>
  Auth.login({ email: req.body?.email, password: req.body?.password })
);

export const me = wrap((req) => Auth.me({ userId: req.userId }));

export const deleteMe = async (req, res) => {
  try {
    await Auth.deleteAccount({ userId: req.userId });
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'internal_error' });
  }
};

export const logoutAll = wrap((req) => Auth.logoutAll({ userId: req.userId }));
