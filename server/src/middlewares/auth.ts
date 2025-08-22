// server/src/middlewares/auth.ts
import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

function getToken(req: Request): string | undefined {
  // requires cookie-parser middleware
  const cookieToken = (req as any).cookies?.token as string | undefined;

  const h = req.headers.authorization || '';
  const bearer = h.startsWith('Bearer ') ? h.slice(7) : undefined;

  return cookieToken ?? bearer;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: 'JWT secret not configured' });

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & {
      id?: string;
      sub?: string;
      email?: string;
      name?: string;
    };

    const id = decoded.id ?? decoded.sub;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    req.user = { id, email: decoded.email, name: decoded.name };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export default requireAuth;
