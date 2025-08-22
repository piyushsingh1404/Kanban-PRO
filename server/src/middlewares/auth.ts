import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  userId?: string;
  user?: { id: string; email?: string; name?: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    // prefer httpOnly cookie (sameSite/secure), fallback to Bearer for local/dev
    const token = (req as any).cookies?.token || bearer;
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
