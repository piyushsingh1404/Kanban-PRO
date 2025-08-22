import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type JWTPayload = { id?: string; sub?: string; email?: string; name?: string; iat?: number; exp?: number };
export interface AuthedRequest extends Request {
  user?: { id: string; email?: string; name?: string };
}

function getToken(req: Request): string | undefined {
  const cookieToken = (req as any).cookies?.token as string | undefined;
  const h = req.headers.authorization || '';
  const bearer = h.startsWith('Bearer ') ? h.slice(7) : undefined;
  return cookieToken || bearer;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT secret not configured' });

    const decoded = jwt.verify(token, secret) as JWTPayload;
    const id = decoded.id ?? decoded.sub;
    if (!id) return res.status(401).json({ message: 'Invalid token payload' });

    const user = { id, email: decoded.email, name: decoded.name };
    (req as AuthedRequest).user = user;
    (res.locals as any).user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

export default requireAuth;
