import type { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";
import { env } from "../../config/env.config";

export interface RateLimitOptions {
    max: number;          // Maximum requests allowed within window
    windowMs: number;     // Window duration in milliseconds
    message?: string;     // Customized error message on rate limit breach
}

// Instantiate Redis client for rate limiting
let redisClient: Redis | null = null;
try {
    redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
    });
    redisClient.on("error", (err) => {
        console.error("Redis rate limiter client error:", err);
    });
} catch (err) {
    console.error("Failed to connect to Redis for rate-limiting:", err);
}

/**
 * Custom Redis-backed Rate Limiter middleware.
 * Cluster-safe, high-performance, and handles Redis downtime gracefully.
 */
export function createRateLimiter(options: RateLimitOptions) {
    const { max, windowMs, message = "Too many requests. Please try again later." } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.socket.remoteAddress || "global";
        const key = `rl:${req.path}-${ip}`;

        if (!redisClient) {
            // Fallback: if Redis is unavailable, let the request proceed to avoid downtime
            return next();
        }

        try {
            const current = await redisClient.incr(key);

            if (current === 1) {
                // Set TTL (convert ms to seconds, ensuring at least 1s)
                await redisClient.expire(key, Math.max(1, Math.ceil(windowMs / 1000)));
            }

            const ttl = await redisClient.ttl(key);

            // Set rate limit headers for transparency
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, max - current));
            res.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : 0));

            if (current > max) {
                res.status(429).json({
                    success: false,
                    message
                });
                return;
            }

            next();
        } catch (error) {
            console.error("[RateLimiter] Redis command failed, bypassing limit:", error);
            next();
        }
    };
}
