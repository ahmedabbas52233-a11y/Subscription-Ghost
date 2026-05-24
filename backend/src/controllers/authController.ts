import { Request, Response } from "express";
import jwt   from "jsonwebtoken";
import crypto from "crypto";
import User   from "../models/User";

const sign = (secret: string, exp: string) => (id: string) =>
  jwt.sign({ userId: id }, secret, { expiresIn: exp } as object);

const signAccess  = () => sign(
  process.env.JWT_ACCESS_SECRET!,
  process.env.JWT_ACCESS_EXPIRES  ?? "15m"
);
const signRefresh = () => sign(
  process.env.JWT_REFRESH_SECRET!,
  process.env.JWT_REFRESH_EXPIRES ?? "7d"
);

const hash = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    if (await User.findOne({ email: req.body.email })) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }
    const user   = await User.create(req.body);
    const access = signAccess()(String(user._id));
    const refresh= signRefresh()(String(user._id));
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: hash(refresh) } });
    res.status(201).json({ success: true, data: { user, accessToken: access, refreshToken: refresh } });
  } catch (e) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password +refreshTokens");
    if (!user || !(await user.comparePassword(req.body.password))) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const access  = signAccess()(String(user._id));
    const refresh = signRefresh()(String(user._id));
    user.refreshTokens.push(hash(refresh));
    await user.save();
    res.json({ success: true, data: { user, accessToken: access, refreshToken: refresh } });
  } catch {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ success: false, message: "Refresh token required" }); return; }
    const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const user = await User.findById(userId).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(hash(refreshToken))) {
      res.status(401).json({ success: false, message: "Invalid refresh token" }); return;
    }
    user.refreshTokens = user.refreshTokens.filter(t => t !== hash(refreshToken));
    const newRefresh   = signRefresh()(userId);
    user.refreshTokens.push(hash(newRefresh));
    await user.save();
    res.json({ success: true, data: { accessToken: signAccess()(userId), refreshToken: newRefresh } });
  } catch {
    res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (refreshToken) await User.updateMany({}, { $pull: { refreshTokens: hash(refreshToken) } });
  res.json({ success: true, message: "Logged out" });
};
