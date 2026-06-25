<<<<<<< HEAD
import { Worker } from 'bullmq';
import cron from 'node-cron';
import Subscription from '../models/Subscription';
import Alert from '../models/Alert';
import { sendRenewalAlert } from '../services/emailService';
import { alertQueue, bullmqConnection } from '../config/redis';
import User from '../models/User';

const ALERT_DAYS = [7, 3, 1];

/* ── Schedule daily check at 08:00 UTC ──────────────────────── */
export const startAlertScheduler = (): void => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily renewal alert check…');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 8);

      // Fetch subscriptions renewing within the next 8 days
      const upcoming = await Subscription.find({
        status:      'active',
        nextRenewal: { $gte: today, $lte: maxDate },
      }).populate('userId');

      for (const sub of upcoming) {
        const days = Math.ceil(
          (sub.nextRenewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        for (const threshold of ALERT_DAYS) {
          if (days === threshold && !sub.alertsSent.includes(threshold)) {
            // Queue email job
            await alertQueue.add(
              'send-alert',
              { subId: String(sub._id), userId: String(sub.userId), days, threshold },
              { jobId: `${sub._id}-${threshold}d` }   // dedupe key
            );

            // Create in-app alert
            const type = threshold === 1 ? 'urgent' : threshold === 3 ? 'warning' : 'info';
            await Alert.create({
              userId:  sub.userId,
              subId:   sub._id,
              type,
              title:   `${sub.name} renews in ${threshold} day${threshold > 1 ? 's' : ''}`,
              message: `$${sub.price}/month on ${sub.nextRenewal.toDateString()}`,
              emoji:   threshold === 1 ? '⚠️' : '🔔',
            });

            // Mark alert as sent
            sub.alertsSent.push(threshold);
=======
import cron from "node-cron";
import { Worker }        from "bullmq";
import { alertQueue, redis } from "../config/redis";
import Subscription      from "../models/Subscription";
import Alert             from "../models/Alert";
import User              from "../models/User";
import { sendRenewalAlert } from "../services/emailService";

const THRESHOLDS = [7, 3, 1];

/* ── Daily 08:00 UTC cron ─────────────────────────────────────── */
export const startAlertScheduler = (): void => {
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Running daily renewal check…");
    try {
      const today  = new Date(); today.setHours(0,0,0,0);
      const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + 8);

      const upcoming = await Subscription.find({
        status:      "active",
        nextRenewal: { $gte: today, $lte: cutoff },
      });

      for (const sub of upcoming) {
        const days = Math.ceil((sub.nextRenewal.getTime() - today.getTime()) / 86_400_000);

        for (const t of THRESHOLDS) {
          if (days === t && !sub.alertsSent.includes(t)) {
            const type = t === 1 ? "urgent" : t === 3 ? "warning" : "info";

            // Queue email job (deduplicated)
            await alertQueue.add(
              "renewal-email",
              { subId: String(sub._id), userId: String(sub.userId), days: t },
              { jobId: `${sub._id}-${t}d` }
            );

            // In-app alert
            await Alert.create({
              userId: sub.userId, subId: sub._id, type,
              title:  `${sub.name} renews in ${t} day${t > 1 ? "s" : ""}`,
              message:`$${sub.price}/month · ${sub.nextRenewal.toDateString()}`,
              emoji:  t === 1 ? "⚠️" : "🔔",
            });

            sub.alertsSent.push(t);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
            await sub.save();
          }
        }
      }
<<<<<<< HEAD

      console.log(`✅ Alert check done — processed ${upcoming.length} subscriptions`);
    } catch (err) {
      console.error('❌ Alert scheduler error:', err);
    }
  });

  console.log('📅 Alert scheduler started (daily @ 08:00 UTC)');
};

/* ── Worker: actually sends emails ──────────────────────────── */
export const startAlertWorker = (): Worker => {
  const worker = new Worker(
    'alert-queue',
    async (job) => {
      const { subId, userId, days } = job.data;

      const sub  = await Subscription.findById(subId);
      const user = await User.findById(userId);

=======
      console.log(`✅ Alert check complete — ${upcoming.length} subscription(s) checked`);
    } catch (e) {
      console.error("❌ Scheduler error:", e);
    }
  });

  console.log("📅 Alert scheduler active (08:00 UTC daily)");
};

/* ── Email worker ─────────────────────────────────────────────── */
export const startAlertWorker = (): Worker => {
  const worker = new Worker(
    "alert-queue",
    async (job) => {
      const { subId, userId, days } = job.data;
      const [sub, user] = await Promise.all([
        Subscription.findById(subId),
        User.findById(userId),
      ]);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
      if (!sub || !user) return;

      await sendRenewalAlert({
        to:    user.email,
        name:  user.name,
        sub:   sub.name,
        price: sub.price,
        days,
        date:  sub.nextRenewal.toDateString(),
      });
    },
<<<<<<< HEAD
    { connection: bullmqConnection, concurrency: 5 }
  );

  worker.on('completed', (job) => console.log(`✅ Email job ${job.id} done`));
  worker.on('failed',    (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));

=======
    { connection: redis, concurrency: 5 }
  );

  worker.on("completed", j  => console.log(`✅ Email job ${j.id} done`));
  worker.on("failed",    (j, e) => console.error(`❌ Email job ${j?.id} failed:`, e.message));
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  return worker;
};
