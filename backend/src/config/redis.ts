import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/* ── Shared Redis connection (used by plain app code, e.g. caching) ─ */
export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,   // required by BullMQ
});

redisConnection.on('connect', () => console.log('✅ Redis connected'));
redisConnection.on('error',   (err) => console.error('❌ Redis error:', err.message));

/* ── BullMQ connection options ───────────────────────────────────
   BullMQ bundles its own copy of ioredis. Passing a live ioredis
   *instance* created from a different ioredis install can fail to
   type-check (and sometimes misbehave) if versions drift, so we
   hand BullMQ a plain connection config instead and let it manage
   its own client internally. */
const bullmqConnection = { url: REDIS_URL };

/* ── Alert Queue ─────────────────────────────────────────────── */
export const alertQueue = new Queue('alert-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// Note: BullMQ v5 no longer needs a separate QueueScheduler — delayed/
// recurring job promotion is handled internally by the Worker.

export { Queue, Worker, bullmqConnection };
