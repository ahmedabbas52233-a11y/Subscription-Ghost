import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request { userId?: string; }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
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
  }
};
