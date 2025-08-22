// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { login, register, me, logout } from '../controllers/auth.controller';
import { optionalAuth, requireAuth } from '../middlewares/auth';

const r = Router();

r.post('/register', register);
r.post('/login', login);

// /me should never 500; we first try to parse token (optional), then requireAuth if present.
r.get(
  '/me',
  optionalAuth,
  (req, res, next) => ((req as any).userId ? next() : res.json({ user: null })),
  requireAuth,
  me
);

r.post('/logout', logout);

export default r;
