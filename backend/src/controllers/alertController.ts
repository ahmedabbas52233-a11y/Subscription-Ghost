import { Request, Response } from "express";
import Alert from "../models/Alert";

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find({ userId: req.userId })
      .sort({ createdAt: -1 }).limit(60)
      .populate("subId", "name category price");
    res.json({ success: true, count: alerts.length, unread: alerts.filter(a => !a.read).length, data: alerts });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch alerts" });
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const a = await Alert.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { read: true }, { new: true });
    if (!a) { res.status(404).json({ success: false, message: "Not found" }); return; }
    res.json({ success: true, data: a });
  } catch {
    res.status(500).json({ success: false, message: "Failed" });
  }
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  await Alert.updateMany({ userId: req.userId, read: false }, { read: true });
  res.json({ success: true });
};

export const dismiss = async (req: Request, res: Response): Promise<void> => {
  await Alert.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
};
