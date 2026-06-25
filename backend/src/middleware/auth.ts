<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/* ── Augment Express Request ─────────────────────────────────── */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
=======
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request { userId?: string; }
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
<<<<<<< HEAD
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token missing' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    const message = err instanceof jwt.TokenExpiredError
      ? 'Access token expired'
      : 'Invalid access token';
    res.status(401).json({ success: false, message });
=======
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Access token missing" });
    return;
  }
  try {
    const { userId } = jwt.verify(
      auth.split(" ")[1],
      process.env.JWT_ACCESS_SECRET!
    ) as { userId: string };
    req.userId = userId;
    next();
  } catch (e) {
    const msg = e instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token";
    res.status(401).json({ success: false, message: msg });
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  }
};
