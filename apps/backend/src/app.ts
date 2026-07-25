import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { documentRoutes } from "./api/routes/document.routes";
import { json } from "body-parser";
import { env } from "./config/env.config";
import { auth } from "./infrastructure/auth/auth";
import { toNodeHandler } from "better-auth/node";
import { globalErrorHandler } from "./api/middlewares/error.middleware";

const app = express();
app.use(json())

app.all("/api/auth/*", toNodeHandler(auth.handler));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/notebooks", documentRoutes);

app.get("/", (req: Request, res: Response) => {
    res.write("App is running!");
})

// Attach the global error handler at the end of the middleware chain
app.use(globalErrorHandler);

app.listen(env.PORT, () => {
    console.log(`server is running on http://localhost:${env.PORT}`)
})