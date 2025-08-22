import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;

    const token = req.cookies?.token || bearer;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email?: string;
      name?: string;
    };

    req.userId = payload.id;                         // <- globally typed
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
