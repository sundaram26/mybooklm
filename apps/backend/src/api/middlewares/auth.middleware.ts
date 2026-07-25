import { auth } from "../../infrastructure/auth/auth";
import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { asyncHandler } from "../../utils/asyncHandler";

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    
    // Attach session/user to res.locals (the Express standard way)
    res.locals.user = session.user;
    res.locals.session = session.session;
    
    next();
});

export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    
    if (session) {
        res.locals.user = session.user;
        res.locals.session = session.session;
    }
    
    next();
});
