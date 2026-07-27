import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../../config/env.config";

const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ to function properly
});

export const ingestionQueue = new Queue("ingestion-queue", { connection });
export const redisConnection = connection;
