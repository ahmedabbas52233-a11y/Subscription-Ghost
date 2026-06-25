import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import Alert from '../models/Alert';

/* ── GET /subscriptions ──────────────────────────────────────── */
export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { category, status = 'active', sort = '-createdAt' } = req.query;

    const filter: Record<string, unknown> = { userId };
    if (category) filter.category = category;
    if (status)   filter.status   = status;

    const subs = await Subscription.find(filter).sort(sort as string);
    res.json({ success: true, count: subs.length, data: subs });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
};

/* ── POST /subscriptions ─────────────────────────────────────── */
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.create({ ...req.body, userId: req.userId });

    // Create an info alert for the new subscription
    await Alert.create({
      userId:  req.userId,
      subId:   sub._id,
      type:    'info',
      title:   `${sub.name} added`,
      message: `Tracking ${sub.name} at $${sub.price}/month`,
      emoji:   '✅',
    });

    res.status(201).json({ success: true, data: sub });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create subscription';
    res.status(400).json({ success: false, message: msg });
  }
};

/* ── GET /subscriptions/:id ──────────────────────────────────── */
export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    res.json({ success: true, data: sub });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
};

/* ── PUT /subscriptions/:id ──────────────────────────────────── */
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    res.json({ success: true, data: sub });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update subscription';
    res.status(400).json({ success: false, message: msg });
  }
};

/* ── DELETE /subscriptions/:id ───────────────────────────────── */
export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    // Remove related alerts
    await Alert.deleteMany({ subId: req.params.id });

    res.json({ success: true, message: 'Subscription deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete subscription' });
  }
};

/* ── DELETE /subscriptions/bulk-delete ───────────────────────── */
export const bulkDeleteSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'ids array is required' });
      return;
    }

    const result = await Subscription.deleteMany({ _id: { $in: ids }, userId: req.userId });
    await Alert.deleteMany({ subId: { $in: ids } });

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete subscriptions' });
  }
};

/* ── GET /subscriptions/stats ────────────────────────────────── */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const subs = await Subscription.find({ userId, status: 'active' });

    const monthlyTotal = subs.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
    const annualTotal  = monthlyTotal * 12;

    const byCategory = subs.reduce<Record<string, number>>((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.monthlyEquivalent;
      return acc;
    }, {});

    const urgent = subs
      .filter(s => s.daysUntilRenewal <= 7 && s.daysUntilRenewal >= 0)
      .length;

    res.json({
      success: true,
      data: {
        totalActive:  subs.length,
        monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
        annualTotal:  parseFloat(annualTotal.toFixed(2)),
        byCategory,
        urgentCount:  urgent,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to compute stats' });
  }
};
