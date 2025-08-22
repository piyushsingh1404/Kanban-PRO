// server/src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: { id: string; email?: string; name?: string };
    }
  }
}
export {};
