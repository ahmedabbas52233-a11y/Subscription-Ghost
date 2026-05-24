import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";

export const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,  // required by BullMQ
  enableReadyCheck:     false,
  lazyConnect:          true,
});

redis.on("connect", ()  => console.log("✅ Redis connected"));
redis.on("error",   (e) => console.error("❌ Redis:", e.message));

export const alertQueue = new Queue("alert-queue", {
  connection: redis,
  defaultJobOptions: {
    attempts:          3,
    backoff:           { type: "exponential", delay: 5_000 },
    removeOnComplete:  100,
    removeOnFail:      200,
  },
});

export { Queue, Worker };
