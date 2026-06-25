import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/* ── Augment Express Request ─────────────────────────────────── */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
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
  }
};
