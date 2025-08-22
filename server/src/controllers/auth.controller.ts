import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthedRequest } from '../middlewares/auth';

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Demo user (keep in sync with seed)
const DEMO_USER = { id: 'demo', email: 'demo1@mail.com', name: 'Demo User' };

export async function login(req: AuthedRequest, res: Response) {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

  if (email !== 'demo1@mail.com' || password !== 'Password@123') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ ...DEMO_USER, token });
}

export async function logout(_req: AuthedRequest, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  res.json({ ok: true });
}

export async function me(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  // Return a consistent shape the client expects
  res.json({ user: req.user });
}
