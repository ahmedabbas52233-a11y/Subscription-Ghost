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
            await sub.save();
          }
        }
      }

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
    { connection: bullmqConnection, concurrency: 5 }
  );

  worker.on('completed', (job) => console.log(`✅ Email job ${job.id} done`));
  worker.on('failed',    (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));

  return worker;
};
