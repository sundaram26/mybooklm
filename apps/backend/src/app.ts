import express from "express";
import type { Request, Response } from "express";
import { json } from "body-parser";
import { env } from "./config/env.config";

const app = express();
app.use(json())

app.get("/", (req: Request, res: Response) => {
    res.write("App is running!");
})

app.listen(env.PORT, () => {
    console.log(`server is running on http://localhost:${env.PORT}`)
})