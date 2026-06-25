import { Request, Response } from 'express';
import Alert from '../models/Alert';

/* ── GET /alerts ─────────────────────────────────────────────── */
export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('subId', 'name category price');

    const unread = alerts.filter(a => !a.read).length;
    res.json({ success: true, count: alerts.length, unread, data: alerts });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
};

/* ── PUT /alerts/:id/read ────────────────────────────────────── */
export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }
    res.json({ success: true, data: alert });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark alert as read' });
  }
};

/* ── POST /alerts/mark-all-read ──────────────────────────────── */
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Alert.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

/* ── DELETE /alerts/:id ──────────────────────────────────────── */
export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }
    res.json({ success: true, message: 'Alert dismissed' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to dismiss alert' });
  }
};
