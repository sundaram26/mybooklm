import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { json } from "body-parser";
import { env } from "./config/env.config";
import { auth } from "./infrastructure/auth/auth";
import { toNodeHandler } from "better-auth/node";
import { globalErrorHandler } from "./api/middlewares/error.middleware";

// Routes & Core Services
import { notebookRoutes } from "./api/routes/notebook.routes";
import { documentRoutes } from "./api/routes/document.routes";
import { chatRoutes } from "./api/routes/chat.routes";
import { IngestionProcessor } from "./core/ingestion/ingestion.processor";
import { createRateLimiter } from "./api/middlewares/rate-limit.middleware";

const app = express();
app.use(json());

// Auth handlers (Express 5 named wildcard syntax)
app.all("/api/auth/*path", toNodeHandler(auth.handler));

// Static files serving
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rate Limiters
const standardLimit = createRateLimiter({ max: 100, windowMs: 60 * 1000 }); // General CRUD
const chatLimit = createRateLimiter({ max: 20, windowMs: 60 * 1000 });       // Grounded Synthesis
const ingestLimit = createRateLimiter({ max: 10, windowMs: 60 * 1000 });     // Ingestions

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