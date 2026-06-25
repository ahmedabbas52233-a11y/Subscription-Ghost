import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';

/* ── Helpers ─────────────────────────────────────────────────── */
const signAccess = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as SignOptions['expiresIn'],
  });

const signRefresh = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as SignOptions['expiresIn'],
  });

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

/* ── Register ────────────────────────────────────────────────── */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password });
    const accessToken  = signAccess(String(user._id));
    const refreshToken = signRefresh(String(user._id));

    // Store hashed refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashToken(refreshToken) },
    });

    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ success: false, message: msg });
  }
};

/* ── Login ───────────────────────────────────────────────────── */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const match = await user.comparePassword(password);
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken  = signAccess(String(user._id));
    const refreshToken = signRefresh(String(user._id));

    user.refreshTokens.push(hashToken(refreshToken));
    await user.save();

    res.json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/* ── Refresh ─────────────────────────────────────────────────── */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const hashed = hashToken(refreshToken);

    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(hashed)) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter(t => t !== hashed);
    const newRefresh = signRefresh(String(user._id));
    user.refreshTokens.push(hashToken(newRefresh));
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken:  signAccess(String(user._id)),
        refreshToken: newRefresh,
      },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

/* ── Logout ──────────────────────────────────────────────────── */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        const hashed = hashToken(refreshToken);
        await User.findByIdAndUpdate(decoded.userId, { $pull: { refreshTokens: hashed } });
      } catch {
        // Token already invalid/expired — nothing to clean up, still a successful logout client-side.
      }
    }
    res.json({ success: true, message: 'Logged out' });
  } catch {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

/* ── Me ──────────────────────────────────────────────────────── */
// Requires the `protect` middleware to have set req.userId from a valid access token.
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};
