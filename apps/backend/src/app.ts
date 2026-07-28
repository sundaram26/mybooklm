import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { json } from "body-parser";
import cors from "cors";
import { env } from "./config/env.config";
import { auth } from "./infrastructure/auth/auth";
import { toNodeHandler } from "better-auth/node";
import { globalErrorHandler } from "./api/middlewares/error.middleware";

// Routes & Core Services
import { notebookRoutes } from "./api/routes/notebook.routes";
import { documentRoutes } from "./api/routes/document.routes";
import { chatRoutes } from "./api/routes/chat.routes";
import { IngestionProcessor, ingestionWorker } from "./core/ingestion/ingestion.processor";
import { createRateLimiter } from "./api/middlewares/rate-limit.middleware";

const app = express();
app.use(cors({
    origin: ["http://localhost:3000", "https://noetalm.sundaramsingh.com"],
    credentials: true,
}));
app.use(json());

// Auth handlers (Express 5 named wildcard syntax + proxy header normalization)
app.all("/api/auth/*path", (req, res) => {
    const proto = req.headers["x-forwarded-proto"];
    if (proto && typeof proto === "string") {
        req.headers["x-forwarded-proto"] = proto.split(',')[0]?.trim();
    }
    const hostHeader = req.headers["x-forwarded-host"];
    if (hostHeader && typeof hostHeader === "string") {
        req.headers["x-forwarded-host"] = hostHeader.split(',')[0]?.trim();
    }
    return toNodeHandler(auth.handler)(req, res);
});

// Static files serving
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rate Limiters
const standardLimit = createRateLimiter({ max: 500, windowMs: 60 * 1000 }); // General CRUD
const chatLimit = createRateLimiter({ max: 50, windowMs: 60 * 1000 });       // Grounded Synthesis
const ingestLimit = createRateLimiter({ max: 300, windowMs: 60 * 1000 });     // Ingestions & Polling

// Mount Routes under /api/notebooks
app.use("/api/notebooks", standardLimit, notebookRoutes);
app.use("/api/notebooks", ingestLimit, documentRoutes);
app.use("/api/notebooks", chatLimit, chatRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("NotebookLM Backend is running!");
});

// Attach global error handler
app.use(globalErrorHandler);

// Start server and recover any stuck ingestion queue tasks
app.listen(env.PORT, () => {
    console.log(`server is running on http://localhost:${env.PORT}`);

    // Non-blocking trigger of the queue recovery service on startup
    IngestionProcessor.recoverQueue().catch(err => {
        console.error("Failed to run ingestion queue recovery:", err);
    });
});