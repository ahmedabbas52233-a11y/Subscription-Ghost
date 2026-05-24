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
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
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
    res.json({
      success: true,
      data: {
        totalActive:  subs.length,
        monthlyTotal: +monthlyTotal.toFixed(2),
        annualTotal:  +(monthlyTotal * 12).toFixed(2),
        byCategory,
        urgentCount,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to compute stats" });
  }
};
