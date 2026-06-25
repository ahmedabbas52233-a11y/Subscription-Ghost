<<<<<<< HEAD
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
=======
import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import Alert        from "../models/Alert";

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status = "active", sort = "-createdAt" } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    const subs = await Subscription.find(filter).sort(sort as string);
    res.json({ success: true, count: subs.length, data: subs });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch subscriptions" });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.create({ ...req.body, userId: req.userId });
    await Alert.create({ userId: req.userId, subId: sub._id, type: "success", title: `${sub.name} added`, message: `Tracking ${sub.name} · $${sub.price}/mo`, emoji: "✅" });
    res.status(201).json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!sub) { res.status(404).json({ success: false, message: "Not found" }); return; }
    res.json({ success: true, data: sub });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch subscription" });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
<<<<<<< HEAD
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

=======
    if (!sub) { res.status(404).json({ success: false, message: "Not found" }); return; }
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!sub) { res.status(404).json({ success: false, message: "Not found" }); return; }
    await Alert.deleteMany({ subId: req.params.id });
    res.json({ success: true, message: "Deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete subscription" });
  }
};

export const stats = async (req: Request, res: Response): Promise<void> => {
  try {
    const subs         = await Subscription.find({ userId: req.userId, status: "active" });
    const monthlyTotal = subs.reduce((s: number, x) => s + (x as unknown as { monthlyEquivalent: number }).monthlyEquivalent, 0);
    const byCategory   = subs.reduce<Record<string, number>>((acc, s) => {
      const me = (s as unknown as { monthlyEquivalent: number }).monthlyEquivalent;
      acc[s.category] = (acc[s.category] ?? 0) + me;
      return acc;
    }, {});
    const urgentCount  = subs.filter(s => {
      const d = (s as unknown as { daysUntilRenewal: number }).daysUntilRenewal;
      return d <= 7 && d >= 0;
    }).length;
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    res.json({
      success: true,
      data: {
        totalActive:  subs.length,
<<<<<<< HEAD
        monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
        annualTotal:  parseFloat(annualTotal.toFixed(2)),
        byCategory,
        urgentCount:  urgent,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to compute stats' });
=======
        monthlyTotal: +monthlyTotal.toFixed(2),
        annualTotal:  +(monthlyTotal * 12).toFixed(2),
        byCategory,
        urgentCount,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to compute stats" });
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  }
};
