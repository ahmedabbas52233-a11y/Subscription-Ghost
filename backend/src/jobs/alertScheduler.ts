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
            await sub.save();
          }
        }
      }
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
    { connection: redis, concurrency: 5 }
  );

  worker.on("completed", j  => console.log(`✅ Email job ${j.id} done`));
  worker.on("failed",    (j, e) => console.error(`❌ Email job ${j?.id} failed:`, e.message));
  return worker;
};
