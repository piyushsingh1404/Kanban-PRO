// server/src/middlewares/auth.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  userId?: string;
  user?: { id: string; email?: string; name?: string };
}

function parseToken(req: Request): string | undefined {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  // Prefer httpOnly cookie token; allow Bearer fallback for dev/tools
  // @ts-ignore
  const cookieToken = req.cookies?.token as string | undefined;
  return cookieToken || bearer;
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = parseToken(req);
    const secret = process.env.JWT_SECRET;
    if (token && secret) {
      const payload = jwt.verify(token, secret) as { id?: string; sub?: string; email?: string; name?: string };
      const id = payload.id ?? payload.sub;
      if (id) {
        req.userId = id;
        req.user = { id, email: payload.email, name: payload.name };
      }
    }
  } catch {
    // ignore decoding errors in optional path
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = parseToken(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT secret not configured' });

    const payload = jwt.verify(token, secret) as { id?: string; sub?: string; email?: string; name?: string };
    const id = payload.id ?? payload.sub;
    if (!id) return res.status(401).json({ message: 'Invalid token' });

    req.userId = id;
    req.user = { id, email: payload.email, name: payload.name };
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

export default requireAuth;
