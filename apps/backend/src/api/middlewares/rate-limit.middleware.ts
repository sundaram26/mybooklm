import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
    tokens: number;
    lastRefill: number;
}

// In-memory registry to store client rate limits
const memoryStore = new Map<string, RateLimitStore>();

// Cleanup stale records periodically to avoid memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
        // If bucket is fully refilled and hasn't been accessed for a long window, clean it up
        if (now - record.lastRefill > 10 * 60 * 1000) {
            memoryStore.delete(key);
        }
    }
}, 5 * 60 * 1000).unref(); // .unref() ensures this timer does not block process exit

export interface RateLimitOptions {
    max: number;          // Maximum requests allowed within window
    windowMs: number;     // Window duration in milliseconds
    message?: string;     // Customized error message on rate limit breach
}

/**
 * Custom Token Bucket Rate Limiter middleware.
 * Guarantees high-performance, zero dependencies, and path-specific limits.
 */
export function createRateLimiter(options: RateLimitOptions) {
    const { max, windowMs, message = "Too many requests. Please try again later." } = options;
    const refillRate = max / windowMs; // token refill rate per millisecond

    return (req: Request, res: Response, next: NextFunction) => {
        // Use client IP address or fallback
        const ip = req.ip || req.socket.remoteAddress || "global";
        const key = `${req.path}-${ip}`;

        const now = Date.now();
        let record = memoryStore.get(key);

        if (!record) {
            record = {
                tokens: max,
                lastRefill: now
            };
            memoryStore.set(key, record);
        } else {
            // Refill tokens based on time elapsed since last request
            const elapsed = now - record.lastRefill;
            const refilled = elapsed * refillRate;
            
            record.tokens = Math.min(max, record.tokens + refilled);
            record.lastRefill = now;
        }

        // Consume a token if we have at least one token available
        if (record.tokens >= 1) {
            record.tokens -= 1;
            memoryStore.set(key, record);
            
            // Set rate limit headers for transparency
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", Math.floor(record.tokens));
            
            next();
        } else {
            res.status(429).json({
                success: false,
                message
            });
        }
    };
}
