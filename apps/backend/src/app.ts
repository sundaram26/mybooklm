import express from "express";
import type { Request, Response } from "express";
import { json } from "body-parser";
import { env } from "./config/env.config";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(json())

app.all("/api/auth/*", toNodeHandler(auth.handler));

app.get("/", (req: Request, res: Response) => {
    res.write("App is running!");
})

// Attach the global error handler at the end of the middleware chain
app.use(globalErrorHandler);

app.listen(env.PORT, () => {
    console.log(`server is running on http://localhost:${env.PORT}`)
})