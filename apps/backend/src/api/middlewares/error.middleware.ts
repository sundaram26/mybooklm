import type { Request, Response, NextFunction } from "express";
import { env } from "../../config/env.config";

export interface CustomError extends Error {
    statusCode?: number;
    errors?: any[];
}

/**
 * Global Error Handling Middleware.
 * All errors passed to `next(err)` will be caught here and formatted cleanly.
 */
export const globalErrorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    if (env.NODE_ENV !== "production") {
        console.error(`[Error]: ${message}`, err.stack);
    }
    
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        stack: env.NODE_ENV === "production" ? undefined : err.stack,
    });
};
