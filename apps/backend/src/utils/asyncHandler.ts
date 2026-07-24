import type { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async Express route handler or middleware.
 * Automatically catches any rejected promises and passes the error to `next()`,
 * removing the need for manual try-catch blocks in your controllers.
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
